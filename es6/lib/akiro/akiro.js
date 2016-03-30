import ChainLink from "mrt";
import Conan from "conan";
import ConanAwsLambda from "conan-aws-lambda";
import path from "path";
import temp from "temp";
import privateData from "incognito";
import NpmPackageBuilder from "../npmPackageBuilder/npmPackageBuilder.js";

import AkiroPackages from "../akiroPackages/akiroPackages.js";
import AkiroPackage from "../akiroPackage/akiroPackage.js";

import packageJson from "../../../package.json";

const setParameters = Symbol();
const setLinks = Symbol();
const setDefaults = Symbol();
const setPrivateData = Symbol();
const setNpmPackageBuilder = Symbol();
const setConan = Symbol();
const setLambda = Symbol();

export default class Akiro extends ChainLink {
	initialize(config = {}) {
		this[setParameters]();
		this[setLinks]();
		this[setDefaults](config);
		this[setPrivateData](config);
		this[setConan]();
		this[setLambda]();
		this[setNpmPackageBuilder]();
	}

	install(callback) {
		const install = require("../akiro/akiro.install.js").default;
		return install.call(this, callback);
	}

	[setParameters]() {
		this.parameters(
			"role",
			"region",
			"bucket",
			"temporaryDirectoryPath",
			"builderDependencies"
		);
	}

	[setLinks]() {
		this.link("packages", AkiroPackages);
	}

	[setDefaults](config) {
		this.role(config.role);
		this.region(config.region);
		this.bucket(config.bucket);

		this.builderDependencies(config.builderDependencies || packageJson.builderDependencies);

		config.libraries = config.libraries || {};

		const temporaryDirectoryPath = config.temporaryDirectoryPath || temp.mkdirSync();
		this.temporaryDirectoryPath(temporaryDirectoryPath);
	}

	[setPrivateData](config) {
		const _ = privateData(this);
		_.Conan = config.libraries.conan || Conan;
		_.NpmPackageBuilder = config.libraries.npmPackageBuilder || NpmPackageBuilder;
	}

	[setNpmPackageBuilder]() {
		const _ = privateData(this);
		this.npmPackageBuilder = new _.NpmPackageBuilder();
	}

	[setConan]() {
		const _ = privateData(this);

		this.conan = new _.Conan();
		this.conan.use(ConanAwsLambda);
	}

	[setLambda]() {
		const handlerFilePath = path.normalize(`${__dirname}/../builders/nodejs/handler.js`);

		this.lambda = this.conan.lambda("AkiroBuilder");
		this.lambda
			.timeout(300)
			.filePath(handlerFilePath)
			.role(this.role());
	}
}

export { AkiroPackages, AkiroPackage };
