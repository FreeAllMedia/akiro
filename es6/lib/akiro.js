import privateData from "incognito";
import Conan, { ConanAwsLambdaPlugin } from "conan";
import { builderDependencies } from "../../package.json";
import path from "path";
import temp from "temp";
import AkiroBuilder from "./akiro/builders/nodejs/akiroBuilder.js";
import Async from "flowsync";
import fileSystem from "fs-extra";

export default class Akiro {
	constructor(config={}) {
		const _ = privateData(this);

		_.config = config;
		_.config.region = _.config.region || "us-east-1";

		this.conan = _.config.conan || new Conan({ region: _.config.region });
		this.conan.use(ConanAwsLambdaPlugin);

		this.temp = _.config.temp || temp;
		this.temp.track();
	}

	get config() {
		return privateData(this).config;
	}

	initialize(iamRoleName, callback) {
		const conan = this.conan;

		const lambdaName = "akiroBuilder";
		const lambdaRole = iamRoleName;
		const lambdaFilePath = __dirname + "/akiro/builders/nodejs/akiroBuilder.js";
		const handlerFilePath = __dirname + "/akiro/builders/nodejs/handler.js";

		const lambda = conan.lambda(lambdaName, handlerFilePath, lambdaRole);
		lambda.dependencies(lambdaFilePath);

		const addBuilderDependencies = (dependencyName, dependencyVersionRange) => {
			return (done) => {
				this.temp.mkdir(`akiro.initialize.${dependencyName}`, (error, temporaryDirectoryPath) => {
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

					const context = {
						temp: mockTemp,
						succeed: () => {
							lambda.dependencies(`${temporaryDirectoryPath}/node_modules/**/{*.*,.*}`);
							done();
						},
						fail: (failError) => {
							done(failError);
						}
					};

					const builder = new AkiroBuilder(event, context);
					builder.invoke(event, context);
				});
			};
		};

		Async.series([
			(done) => {
				let builderDependencyTasks = [];

				for (let dependencyName in builderDependencies) {
					const dependencyVersionRange = builderDependencies[dependencyName];
					builderDependencyTasks.push(addBuilderDependencies(dependencyName, dependencyVersionRange));
				}

				Async.parallel(builderDependencyTasks, done);
			},
			(done) => {
				conan.deploy(done);
			},
			(done) => {
				done();
				// this.temp.cleanup(done);
			}
		], callback);
	}
}
