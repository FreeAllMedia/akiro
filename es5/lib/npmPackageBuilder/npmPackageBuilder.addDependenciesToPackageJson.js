"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = addDependenciesToPackageJson;

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function addDependenciesToPackageJson(done) {
	var packageJsonFilePath = this.outputDirectoryPath() + "/package.json";
	var packageJson = require(packageJsonFilePath);
	packageJson.description = "Temporary AkiroBuilder package.json for generation.";
	packageJson.repository = "https://this.doesntreallyexist.com/something.git";
	packageJson.dependencies = this.packageList();
	_fs2.default.writeFile(packageJsonFilePath, JSON.stringify(packageJson), done);
}