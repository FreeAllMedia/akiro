"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = buildDependencies;

var _incognito = require("incognito");

var _incognito2 = _interopRequireDefault(_incognito);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function buildDependencies(done) {
	var NpmPackageBuilder = (0, _incognito2.default)(this).NpmPackageBuilder;
	var npmPackageBuilder = new NpmPackageBuilder(this.builderDependencies(), this.temporaryDirectoryPath() + "/node_modules");
	npmPackageBuilder.build(done);
}