export default class Akiro {
	build(filePath, callback) {
		return require("./akiro/akiro.build.js").call(this, filePath, callback);
	}
}
