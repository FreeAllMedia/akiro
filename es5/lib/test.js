"use strict";

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _akiroJs = require("./akiro.js");

var _akiroJs2 = _interopRequireDefault(_akiroJs);

var akiro = new _akiroJs2["default"]();

akiro.initialize("AWSLambda", function (error) {
	if (error) {
		throw error;
	}
	console.log("Akiro deployed.");
});