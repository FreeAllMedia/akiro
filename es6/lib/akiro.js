import privateData from "incognito";
import Conan, { ConanAwsLambdaPlugin } from "conan";
import { dependencies } from "../../package.json";
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

		const lambdaName = "Akiro";
		const lambdaRole = iamRoleName;
		const lambdaFilePath = __dirname + "/akiro/packagers/akiro.packager.nodejs.js";

		const packageDependencyNames = Object.keys(dependencies);

		const packageDependencyPaths = [];
		packageDependencyNames.forEach((packageDependencyName) => {
			const nodeModulesDirectoryPath = path.normalize(`${__dirname}/../../node_modules`);
			const packageDependencyPath = `${nodeModulesDirectoryPath}/${packageDependencyName}/**/{*.*,.*}`;
			packageDependencyPaths.push(packageDependencyPath);
		});

		//console.log(packageDependencyPaths);

		conan
			.lambda(lambdaName, lambdaFilePath, lambdaRole)
				.dependencies(packageDependencyPaths);

		conan
			.deploy(callback);
	}
}
