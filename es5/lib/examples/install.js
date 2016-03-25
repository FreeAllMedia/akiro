"use strict";

var _akiro = require("../akiro.js");

var _akiro2 = _interopRequireDefault(_akiro);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var akiro = new _akiro2.default(); /* eslint-disable no-console */

console.log("Akiro deploying...");
akiro.debug.region("us-east-1").bucket("fam-akiro").roleName("AWSLambda").install(function (error) {
	if (error) {
		throw error;
	}
	console.log("Akiro deployed.");
});