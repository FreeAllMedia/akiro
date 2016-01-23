import privateData from "incognito";
import Conan, { ConanAwsLambdaPlugin } from "conan";
import { builderDependencies } from "../../package.json";
import path from "path";
import temp from "temp";
import AkiroBuilder from "./akiro/builders/nodejs/akiroBuilder.js";
import Async from "flowsync";
import { exec } from "child_process";
import AWS from "aws-sdk";
import fileSystem from "fs-extra";
import unzip from "unzip2";

export default class Akiro {
	constructor(config={}) {
		const _ = privateData(this);

		_.config = config;
		_.config.region = _.config.region || "us-east-1";

		this.conan = _.config.conan || new Conan({ region: _.config.region });
		this.conan.use(ConanAwsLambdaPlugin);

		this.Async = _.config.Async || Async;
		this.AWS = _.config.AWS || AWS;
		this.temp = _.config.temp || temp;
		this.exec = _.config.exec || exec;
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
		const handlerFilePath = __dirname + "/akiro/builders/nodejs/handler.js";

		const lambda = conan.lambda(lambdaName, handlerFilePath, lambdaRole);
		lambda.dependencies(lambdaFilePath);

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
				lambda.dependencies(`${temporaryDirectoryPath}/node_modules/**/*`);
				conan.deploy(callback);
			});
		});
	}

	package(packageDetails, outputDirectoryPath, callback) {
		const lambda = new this.AWS.Lambda({ region: this.config.region });
		const s3 = new this.AWS.S3({ region: this.config.region });

		let invokeLambdaTasks = [];

		for (let packageName in packageDetails) {
			const packageVersionRange = packageDetails[packageName];
			invokeLambdaTasks.push(createInvokeLambdaTask(packageName, packageVersionRange, this));
		}

		function createInvokeLambdaTask(packageName, packageVersionRange, context) {
			return (done) => {
				lambda.invoke({
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

		this.Async.parallel(invokeLambdaTasks, (error, data) => {

			function createGetObjectTask(fileName, context) {
				return (done) => {
					const objectReadStream = s3.getObject({
						Bucket: context.config.bucket,
						Key: fileName
					}).createReadStream();

					const objectLocalFileName = `${context.cacheDirectoryPath}/${fileName}`;
					const objectWriteStream = fileSystem.createWriteStream(objectLocalFileName);

					objectWriteStream
						.on("close", () => {
							/* eslint-disable new-cap */

							let writeFileTasks = [];

							function createWriteFileTask(outputFileName, entry) {
								return writeTaskDone => {
									const fileWriteStream = fileSystem.createWriteStream(outputFileName);
									fileWriteStream.on("close", writeTaskDone);

									entry.pipe(fileWriteStream);
								};
							}

							fileSystem.createReadStream(objectLocalFileName)
								.pipe(unzip.Parse())
								.on("entry", entry => {
									const outputFileName = `${outputDirectoryPath}/${entry.path}`;
									writeFileTasks.push(createWriteFileTask(outputFileName, entry));
								})
								.on("close", () => {
									Async.parallel(writeFileTasks, done);
								});
						});

					objectReadStream
						.pipe(objectWriteStream);
				};
			}

			if (!error) {
				let getObjectTasks = [];

				data.forEach(returnData => {
					const fileName = returnData.fileName;
					getObjectTasks.push(createGetObjectTask(fileName, this));
				});

				this.Async.parallel(getObjectTasks, callback);
			} else {
				callback(error);
			}
		});
	}
}
