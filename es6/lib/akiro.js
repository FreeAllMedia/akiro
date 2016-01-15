import privateData from "incognito";
import Conan, { ConanAwsLambdaPlugin } from "conan";
import { packagerDependencies } from "../../package.json";
import path from "path";

export default class Akiro {
	constructor(config={}) {
		const _ = privateData(this);

		_.config = config;
		_.config.region = _.config.region || "us-east-1";

		this.conan = _.config.conan || new Conan({ region: _.config.region });
	}

	get config() {
		return privateData(this).config;
	}

	initialize(iamRoleName, callback) {
		const conan = this.conan;

		conan.use(ConanAwsLambdaPlugin);

		const lambdaName = "akiroPackager";
		const lambdaRole = iamRoleName;
		const lambdaFilePath = __dirname + "/akiro/packagers/nodejs/akiroPackager.js";
		const handlerFilePath = __dirname + "/akiro/packagers/nodejs/handler.js";

		const packageDependencyNames = Object.keys(packagerDependencies);

		const packageDependencyPaths = [
			lambdaFilePath
		];
		packageDependencyNames.forEach((packageDependencyName) => {
			const nodeModulesDirectoryPath = path.normalize(`${__dirname}/../../node_modules`);
			const packageDependencyPath = `${nodeModulesDirectoryPath}/${packageDependencyName}/**/{*.*,.*}`;
			packageDependencyPaths.push(packageDependencyPath);
		});

		//console.log(packageDependencyPaths);

		conan
			.lambda(lambdaName, handlerFilePath, lambdaRole)
				.dependencies(packageDependencyPaths);

		conan
			.deploy(callback);
	}
}
