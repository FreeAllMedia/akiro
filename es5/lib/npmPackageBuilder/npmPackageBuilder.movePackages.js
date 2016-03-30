"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = movePackages;

var _fsExtra = require("fs-extra");

var _fsExtra2 = _interopRequireDefault(_fsExtra);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function movePackages(done) {
	_fsExtra2.default.copy(this.outputDirectoryPath() + "/node_modules", this.outputDirectoryPath(), done);
}