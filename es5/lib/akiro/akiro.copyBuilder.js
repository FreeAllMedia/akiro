"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = copyBuilder;

var _fsExtra = require("fs-extra");

var _fsExtra2 = _interopRequireDefault(_fsExtra);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function copyBuilder(done) {
	_fsExtra2.default.copySync(__dirname + "/../akiroBuilder/npm/akiroBuilder.js", this.temporaryDirectoryPath() + "/akiroBuilder.js");
	_fsExtra2.default.copySync(__dirname + "/../akiroBuilder/npm/handler.js", this.temporaryDirectoryPath() + "/handler.js");
	done();
}