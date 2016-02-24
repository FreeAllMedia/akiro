"use strict";

var _akiro = require("./akiro.js");

var _akiro2 = _interopRequireDefault(_akiro);

var _package = require("../../package.json");

var _package2 = _interopRequireDefault(_package);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var akiro = new _akiro2.default({
	region: "us-east-1",
	bucket: "fam-akiro"
});

// const iamRoleName = "AWSLambda";
// console.log("Deploying Akiro.");
// akiro.initialize(iamRoleName, error => {
// 	if (error) { throw error; }
// 	console.log("Akiro deploy1ed.");
// });

/* eslint-disable no-console */

var outputDirectory = process.cwd() + "/testOutput/";

delete _package2.default.dependencies.npm;

akiro.package({
	"flowsync": "0.1.12"
}, outputDirectory, function (packageError) {
	if (packageError) {
		throw packageError;
	}
	console.log("Akiro done.");
});