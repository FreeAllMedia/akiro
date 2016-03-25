import ChainLink from "mrt";
import Conan from "conan";
import ConanAwsLambda from "conan-aws-lambda";
import path from "path";
import temp from "temp";
import privateData from "incognito";

import AkiroPackages from "./akiroPackages.js";

const setParameters = Symbol();
const setLinks = Symbol();
const setDefaults = Symbol();
const setPrivateData = Symbol();
const setConan = Symbol();
const setLambda = Symbol();

export default class Akiro extends ChainLink {
	initialize(config = {}) {
		this[setParameters]();
		this[setDefaults](config);
		this[setPrivateData](config);
		this[setConan]();
		this[setLambda]();
	}

	[setParameters]() {
		this.parameters(
			"role",
			"region",
			"bucket",
			"temporaryDirectoryPath"
		);
	}

	[setDefaults](config) {
		this.role(config.role);
		this.region(config.region);
		this.bucket(config.bucket);

		const temporaryDirectoryPath = config.temporaryDirectoryPath || temp.mkdirSync();
		this.temporaryDirectoryPath(temporaryDirectoryPath);
	}

	[setPrivateData](config) {
		const _ = privateData(this);
		_.Conan = config.Conan || Conan;
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

export { AkiroPackages };
