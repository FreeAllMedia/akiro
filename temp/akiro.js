import privateData from "incognito";
import Conan from "conan";
import ConanAwsLambdaPlugin from "conan-aws-lambda";
import { builderDependencies } from "../../package.json";
import path from "path";
import temp from "temp";
import AkiroBuilder from "./akiro/builders/nodejs/akiroBuilder.js";
import Async from "flowsync";
import { exec } from "child_process";
import AWS from "aws-sdk";
import fileSystem from "fs-extra";
import Decompress from "decompress";
import util from "util";
import color from "colors";

const invokeBuilderLambdas = Symbol();
const createInvokeLambdaTask = Symbol();
const downloadObjectsFromS3 = Symbol();
const createGetObjectTask = Symbol();
const unzipLocalFile = Symbol();

export default class Akiro {
	constructor(config = {}) {
		const _ = privateData(this);

		_.config = config;
		_.config.region = _.config.region || "us-east-1";

		this.conan = _.config.conan || new Conan({
			region: _.config.region,
			basePath: `${__dirname}/akiro/builders/nodejs/`
		});
		this.conan.use(ConanAwsLambdaPlugin);

		this.Async = _.config.Async || Async;
		this.AWS = _.config.AWS || AWS;
		this.temp = _.config.temp || temp;
		this.exec = _.config.exec || exec;

		this.cacheDirectoryPath = _.config.cacheDirectoryPath || "./.akiro/cache";

		this.debug(".constructor", config);

		//this.temp.track();
	}

	debug(message, parameters) {
		/* eslint-disable no-console */
		const debugLevel = privateData(this).config.debug;

		if (debugLevel !== undefined) {
			let consoleMessage;
			consoleMessage = `${color.red(message)}\n${util.inspect(parameters, true, debugLevel, true)}`;
			console.error(consoleMessage);
		}
	}

	get config() {
		return privateData(this).config;
	}

	initialize(iamRoleName, callback) {
		const conan = this.conan;

		const lambdaName = "AkiroBuilder";
		const lambdaRole = iamRoleName;
		const lambdaFilePath = `${__dirname}/akiro/builders/nodejs/handler.js`;

		const lambda = conan
			.lambda(lambdaName)
			.filePath(lambdaFilePath)
			.role(lambdaRole)
			.timeout(300)
			.memorySize(512)
			.dependencies(`${__dirname}/akiro/builders/nodejs/akiroBuilder.js`);

		const createBuilderTask = (dependencyName, dependencyVersionRange, temporaryDirectoryPath) => {
			return (done) => {
				const mockTemp = {
					mkdir: (directoryName, mkdirCallback) => {
						mkdirCallback(null, temporaryDirectoryPath);
					}
				};

				const event = {
					package: {
						name: dependencyName,
						version: dependencyVersionRange
					}
				};

				const npmPath = path.normalize(`${__dirname}/../../node_modules/npm/bin/npm-cli.js`);

				const context = {
					exec: this.exec,
					npmPath: npmPath,
					temp: mockTemp,
					succeed: () => {
						done();
					}
				};

				const builder = new AkiroBuilder(event, context);
				builder.invoke(event, context);
			};
		};

		this.temp.mkdir("akiro.initialize", (error, temporaryDirectoryPath) => {
			this.Async.series([
				(done) => {
					let builderDependencyTasks = [];

					for (let dependencyName in builderDependencies) {
						const dependencyVersionRange = builderDependencies[dependencyName];
						builderDependencyTasks.push(createBuilderTask(dependencyName, dependencyVersionRange, temporaryDirectoryPath));
					}

					this.Async.series(builderDependencyTasks, done);
				}
			], () => {
				lambda.dependencies(`${temporaryDirectoryPath}/node_modules/**/*`, {
					zipPath: "/node_modules/",
					basePath: `${temporaryDirectoryPath}/node_modules/`
				});
				conan.deploy(callback);
			});
		});
	}

	package(packageDetails, outputDirectoryPath, callback) {
		this.debug(".package()", {
			packageDetails,
			outputDirectoryPath
		});

		const _ = privateData(this);
		_.lambda = new this.AWS.Lambda({ region: this.config.region });
		_.s3 = new this.AWS.S3({ region: this.config.region });

		Async.mapParallel(Object.keys(packageDetails), (packageName, done) => {
			const packageVersionRange = packageDetails[packageName];

			const command = `npm info ${packageName}@${packageVersionRange} version | tail -n 1`;

			this.exec(command, (error, stdout) => {
				let packageLatestVersion;
				if (stdout.indexOf("@") === -1) {
					packageLatestVersion = stdout.replace("\n", "");
				} else {
					packageLatestVersion = stdout.match(/[a-zA-Z0-9]*@(.*) /)[1];
				}

				const cachedFilePath = `${this.cacheDirectoryPath}/${packageName}-${packageLatestVersion}.zip`;

				if (fileSystem.existsSync(cachedFilePath)) {
					this.debug(`cached package found: ${packageName}@${packageLatestVersion}`);
					delete packageDetails[packageName];
					this[unzipLocalFile](cachedFilePath, outputDirectoryPath, done);
				} else {
					this.debug(`cached package NOT found: ${packageName}@${packageLatestVersion}`);
					packageDetails[packageName] = packageLatestVersion;
					done();
				}
			});
		}, () => {
			this[invokeBuilderLambdas](packageDetails, (invokeBuilderLambdasError, data) => {
				this[downloadObjectsFromS3](invokeBuilderLambdasError, data, outputDirectoryPath, callback);
			});
		});
	}

	[invokeBuilderLambdas](packageDetails, callback) {
		let invokeLambdaTasks = [];
		for (let packageName in packageDetails) {
			const packageVersionRange = packageDetails[packageName];
			invokeLambdaTasks.push(this[createInvokeLambdaTask](packageName, packageVersionRange, this));
		}
		this.Async.parallel(invokeLambdaTasks, callback);
	}

	[createInvokeLambdaTask](packageName, packageVersionRange, context) {
		return done => {
			const _ = privateData(context);
			const payload = {
				bucket: context.config.bucket,
				region: context.config.region,
				package: {
					name: packageName,
					version: packageVersionRange
				}
			};

			this.debug(`invoke AkiroBuilder: ${packageName}@${packageVersionRange}`, payload);
			_.lambda.invoke({
				FunctionName: "AkiroBuilder", /* required */
				Payload: JSON.stringify(payload)
			}, (error, data) => {
				this.debug(`invoke AkiroBuilder complete: ${packageName}@${packageVersionRange}`, data);
				done(error, data);
			});
		};
	}

	[downloadObjectsFromS3](error, data, outputDirectoryPath, callback) {
		if (!error) {
			fileSystem.mkdirpSync(this.cacheDirectoryPath);

			let getObjectTasks = [];

			data.forEach(returnData => {
				returnData = JSON.parse(returnData.Payload);
				this.debug("parsed returnData", returnData);
				const fileName = returnData.fileName;
				getObjectTasks.push(this[createGetObjectTask](fileName, outputDirectoryPath, this));
			});

			this.Async.parallel(getObjectTasks, (getObjectError, getObjectData) => {
				this.debug("get object tasks complete", {
					getObjectError,
					getObjectData
				});
				callback(getObjectError);
			});
		} else {
			callback(error);
		}
	}

	[createGetObjectTask](fileName, outputDirectoryPath, context) {
		const _ = privateData(this);

		return done => {
			this.debug(`downloading completed package zip file: ${fileName}`);

			const objectReadStream = _.s3.getObject({
				Bucket: context.config.bucket,
				Key: fileName
			}).createReadStream();

			const objectLocalFileName = `${context.cacheDirectoryPath}/${fileName}`;
			const objectWriteStream = fileSystem.createWriteStream(objectLocalFileName);

			// objectWriteStream
			// 	.on("error", error => {
			// 		this.debug("ERROR downloading completed package zip file", error);
			// 	});

			objectWriteStream
				.on("close", () => {
					this.debug(`downloaded completed package zip file finished: ${fileName}`);
					this[unzipLocalFile](objectLocalFileName, outputDirectoryPath, done);
				});

			objectReadStream
				.pipe(objectWriteStream);
		};
	}

	[unzipLocalFile](localFileName, outputDirectoryPath, callback) {
		this.debug(`unzipping completed package zip file: ${localFileName}`, {
			outputDirectoryPath
		});

		const moduleName = path.basename(localFileName, ".zip").replace(/-\d*\.\d*\.\d*$/, "");

		new Decompress({mode: "755"})
			.src(localFileName)
			.dest(`${outputDirectoryPath}/${moduleName}`)
			.use(Decompress.zip({strip: 1}))
			.run(() => {
				this.debug("completed package zip file unzipped", {
					localFileName,
					outputDirectoryPath
				});
				callback();
			});
	}
}
