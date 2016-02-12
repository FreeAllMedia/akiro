"use strict";

var _conan = require("conan");

var _conan2 = _interopRequireDefault(_conan);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var conan = new _conan2.default({
	region: "us-east-1"

}); /* eslint-disable no-console */

//import Akiro from "./akiro.js";

// const akiro = new Akiro({
// 	region: "us-east-1",
// 	bucket: "akiro.test"
// });
//
// const iamRoleName = "AWSLambda";
//
// console.log("Deploying Akiro.");
// akiro.initialize(iamRoleName, (error) => {
// 	if (error) { throw error; }
// 	console.log("Akiro deployed.");
// });

// const outputDirectory = `${__dirname}/../../testOutput/`;
//
// akiro.package(packageJson.dependencies, outputDirectory, (packageError) => {
// 	if (packageError) { throw packageError; }
// 	console.log("Akiro deployed.");
// });