"use strict";

var _akiro = require("./akiro.js");

var _akiro2 = _interopRequireDefault(_akiro);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var akiro = new _akiro2.default({
	region: "us-east-1",
	bucket: "akiro.test"
}); /* eslint-disable no-console */

var iamRoleName = "AWSLambda";

console.log("Deploying Akiro.");
akiro.initialize(iamRoleName, function (error) {
	if (error) {
		throw error;
	}
	console.log("Akiro deployed.");
});

// const outputDirectory = `${__dirname}/../../testOutput/`;

// akiro.package(packageJson.dependencies, outputDirectory, (packageError) => {
// 	if (packageError) { throw packageError; }
// 	console.log("Akiro deployed.");
// });

// import Conan from "conan";
//
// const conan = new Conan({
// 	region: "us-east-1",
//
// });