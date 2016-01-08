import privateData from "incognito";

export default class Akiro {
	constructor(config) {
		privateData(this).config = config;
	}

	get config() {
		return privateData(this).config;
	}

	build(filePath, callback) {
		return require("./akiro/akiro.build.js").call(this, filePath, callback);
	}
}
