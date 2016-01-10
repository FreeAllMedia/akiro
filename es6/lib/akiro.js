import privateData from "incognito";
import Conan from "conan";
import { dependencies } from "../../package.json";
import path from "path";

export default class Akiro {
	constructor(config) {
		const _ = privateData(this);

		_.config = config;
		_.conan = _.config.conan || new Conan();
	}

	get config() {
		return privateData(this).config;
	}

	initialize(callback) {
		const conan = privateData(this).conan;

		const lambdaName = "Akiro";
		const lambdaRole = "AkiroLambda";
		const lambdaFilePath = __dirname + "/akiro/packagers/akiro.packager.nodejs.js";

		const packageDependencyNames = Object.keys(dependencies);

		const packageDependencyPaths = [];
		packageDependencyNames.forEach((packageDependencyName) => {
			const nodeModulesDirectoryPath = path.normalize(`${__dirname}/../node_modules`);
			const packageDependencyPath = `${nodeModulesDirectoryPath}/${packageDependencyName}/**/*`;
			packageDependencyPaths.push(packageDependencyPath);
		});

		conan
			.lambda(lambdaName, lambdaFilePath, lambdaRole)
				.dependencies(packageDependencyPaths);

		conan
			.deploy(callback);
	}
}
