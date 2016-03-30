"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = buildPackages;
function buildPackages(done) {
	var commands = ["cd " + this.outputDirectoryPath(), "node " + this.npmPath() + " install"];

	this.libraries.exec(commands.join(";"), done);
}