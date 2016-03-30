"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = installBuilder;
function installBuilder(done) {
	this.conan.deploy(done);
}