import privateData from "incognito";
import Conan, { ConanAwsLambdaPlugin } from "conan";
import { builderDependencies } from "../../package.json";
import path from "path";
import temp from "temp";
import AkiroBuilder from "./akiro/builders/nodejs/akiroBuilder.js";
import Async from "flowsync";
import { exec, execSync } from "child_process";
import AWS from "aws-sdk";
import fileSystem from "fs-extra";
import unzip from "bauer-zip";

const invokeBuilderLambdas = Symbol();
const createInvokeLambdaTask = Symbol();
const downloadObjectsFromS3 = Symbol();
const createGetObjectTask = Symbol();
const unzipLocalFile = Symbol();

export default class Akiro {
	constructor(config={}) {
		const _ = privateData(this);

		_.config = config;
		_.config.region = _.config.region || "us-east-1";

		this.conan = _.config.conan || new Conan({
			region: _.config.region,
			basePath: path.normalize(`${__dirname}/akiro/builders/nodejs/`)
		});
		this.conan.use(ConanAwsLambdaPlugin);

		this.Async = _.config.Async || Async;
		this.AWS = _.config.AWS || AWS;
		this.temp = _.config.temp || temp;
		this.exec = _.config.exec || exec;
		this.execSync = _.config.execSync || execSync;
		this.cacheDirectoryPath = _.config.cacheDirectoryPath || "./.akiro/cache";

		//this.temp.track();
	}

	get config() {
		return privateData(this).config;
	}

	initialize(iamRoleName, callback) {
		const conan = this.conan;

		const lambdaName = "AkiroBuilder";
		const lambdaRole = iamRoleName;
		const lambdaFilePath = __dirname + "/akiro/builders/nodejs/akiroBuilder.js";

		const lambda = conan.lambda(lambdaName, lambdaFilePath, lambdaRole).handler("invoke");

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

		this.temp.mkdir(`akiro.initialize`, (error, temporaryDirectoryPath) => {
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
				lambda.dependencies(`${temporaryDirectoryPath}/node_modules/**/*`, "/node_modules");
				conan.deploy(callback);
			});
		});
	}

	package(packageDetails, outputDirectoryPath, callback) {
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
					delete packageDetails[packageName];
					this[unzipLocalFile](cachedFilePath, outputDirectoryPath, done);
				} else {
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
			_.lambda.invoke({
				FunctionName: "AkiroBuilder", /* required */
				Payload: JSON.stringify({
					bucket: context.config.bucket,
					region: context.config.region,
					package: {
						name: packageName,
						version: packageVersionRange
					}
				})
			}, done);
		};
	}

	[downloadObjectsFromS3](error, data, outputDirectoryPath, callback) {
		if (!error) {
			fileSystem.mkdirpSync(this.cacheDirectoryPath);

			let getObjectTasks = [];

			data.forEach(returnData => {
				const fileName = returnData.fileName;
				getObjectTasks.push(this[createGetObjectTask](fileName, outputDirectoryPath, this));
			});

			this.Async.parallel(getObjectTasks, callback);
		} else {
			callback(error);
		}
	}

	[createGetObjectTask](fileName, outputDirectoryPath, context) {
		const _ = privateData(this);

		return done => {
			const objectReadStream = _.s3.getObject({
				Bucket: context.config.bucket,
				Key: fileName
			}).createReadStream();

			const objectLocalFileName = `${context.cacheDirectoryPath}/${fileName}`;
			const objectWriteStream = fileSystem.createWriteStream(objectLocalFileName);

			objectWriteStream
				.on("close", () => {
					this[unzipLocalFile](objectLocalFileName, outputDirectoryPath, done);
				});

			objectReadStream
				.pipe(objectWriteStream);
		};
	}

	[unzipLocalFile](localFileName, outputDirectoryPath, callback) {
		unzip.unzip(localFileName, outputDirectoryPath, callback);
	}
}
