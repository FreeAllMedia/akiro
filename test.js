/* eslint-disable no-console */

"use strict";

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _akiroJs = require("./es5/lib/akiro.js");

var _akiroJs2 = _interopRequireDefault(_akiroJs);

var akiro = new _akiroJs2["default"]();

var iamRoleName = "AWSLambda";

akiro.initialize(iamRoleName, function (error) {
	if (error) {
		throw error;
	}
	console.log("Akiro deployed.");
});
