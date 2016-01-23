/* eslint-disable no-console */

"use strict";

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _packageJson = require("../../package.json");

var _packageJson2 = _interopRequireDefault(_packageJson);

var _akiroJs = require("./akiro.js");

var _akiroJs2 = _interopRequireDefault(_akiroJs);

var akiro = new _akiroJs2["default"]();

var iamRoleName = "AWSLambda";

akiro.initialize(iamRoleName, function (error) {
	if (error) {
		throw error;
	}
	console.log("Akiro deployed.");

	var outputDirectory = __dirname + "/../../testOutput/";

	akiro["package"](_packageJson2["default"].dependencies, outputDirectory, function (packageError) {
		if (packageError) {
			throw packageError;
		}
		console.log("Akiro deployed.");
	});
});