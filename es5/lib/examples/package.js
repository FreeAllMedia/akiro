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

var packages = {
	"flowsync": "^0.1.12",
	"almaden": "^0.3.1",
	"dovima": "^0.3.2",
	"incognito": "^0.1.4"
};

var outputDirectory = process.cwd() + "/testOutput/";

akiro.package(packages, outputDirectory, function (packageError) {
	if (packageError) {
		throw packageError;
	}
	console.log("Voila!", _fs2.default.readdirSync(outputDirectory));
});