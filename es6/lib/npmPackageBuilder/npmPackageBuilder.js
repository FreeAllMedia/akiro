import fileSystem from "fs";
import ChainLink from "mrt";
import { exec } from "child_process";
import path from "path";
import Async from "flowsync";

const initPackageJson = Symbol();
const createOutputDirectory = Symbol();
const buildPackages = Symbol();
const addDependenciesToPackageJson = Symbol();
const externalFunction = Symbol();
const movePackages = Symbol();

export default class NpmPackageBuilder extends ChainLink {
	initialize(packageList, outputDirectoryPath, configuration = {}) {
		this.parameters("packageList", "outputDirectoryPath", "basePath", "npmPath");

		const libraries = configuration.libraries || {};
		const npmPath = configuration.npmPath || path.normalize(`${__dirname}/../../../node_modules/npm/bin/npm-cli.js`);

		this.libraries = {
			exec: libraries.exec || exec
		};

		this.packageList(packageList);
		this.outputDirectoryPath(outputDirectoryPath);
		this.basePath(configuration.basePath);
		this.npmPath(npmPath);
	}

	build(callback) {
		Async.series(
			[
				this[createOutputDirectory].bind(this),
				this[initPackageJson].bind(this),
				this[addDependenciesToPackageJson].bind(this),
				this[buildPackages].bind(this),
				this[movePackages].bind(this)
			],
			callback
		);
	}

	[createOutputDirectory](done) {
		fileSystem.mkdir(this.outputDirectoryPath(), () => {
			done();
		});
	}

	[initPackageJson](done) {
		const commands = [
			`cd ${this.outputDirectoryPath()}`,
			`node ${this.npmPath()} init -y`
		];

		this.libraries.exec(commands.join(";"), done);
	}

	[addDependenciesToPackageJson](done) {
		this[externalFunction]("./npmPackageBuilder.addDependenciesToPackageJson.js", done);
	}

	[buildPackages](done) {
		this[externalFunction]("./npmPackageBuilder.buildPackages.js", done);
	}

	[movePackages](done) {
		this[externalFunction]("./npmPackageBuilder.movePackages.js", done);
	}

	[externalFunction](functionFilePath, ...parameters) {
		return require(functionFilePath).default.call(this, ...parameters);
	}
}
