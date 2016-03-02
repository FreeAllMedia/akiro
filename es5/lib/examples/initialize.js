"use strict";

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _akiro = require("../akiro.js");

var _akiro2 = _interopRequireDefault(_akiro);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable no-console */

var akiro = new _akiro2.default({
	region: "us-east-1",
	bucket: "fam-akiro",
	debug: 1
});

var iamRoleName = "AWSLambda";
console.log("Deploying Akiro.");
akiro.initialize(iamRoleName, function (error) {
	if (error) {
		throw error;
	}
	console.log("Akiro deployed.");
});