"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = install;

var _npmPackageBuilder = require("../npmPackageBuilder/npmPackageBuilder.js");

var _npmPackageBuilder2 = _interopRequireDefault(_npmPackageBuilder);

var _flowsync = require("flowsync");

var _flowsync2 = _interopRequireDefault(_flowsync);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function install(callback) {
	_flowsync2.default.series([require("./akiro.buildDependencies.js").default.bind(this)], callback);
}