"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = buildDependencies;

var _npmPackageBuilder = require("../npmPackageBuilder/npmPackageBuilder.js");

var _npmPackageBuilder2 = _interopRequireDefault(_npmPackageBuilder);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function buildDependencies(done) {
	var npmPackageBuilder = new _npmPackageBuilder2.default(this.builderDependencies(), this.temporaryDirectoryPath());
	npmPackageBuilder.build(function () {
		console.log("DONE?!?!?!!??!");
		done();
	});
}