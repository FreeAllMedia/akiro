"use strict";

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _libAkiroJs = require("../../lib/akiro.js");

var _libAkiroJs2 = _interopRequireDefault(_libAkiroJs);

var _sinon = require("sinon");

var _sinon2 = _interopRequireDefault(_sinon);

describe("akiro.deploy(callback)", function () {
	var akiro = undefined,
	    callback = undefined,
	    awsLambda = undefined;

	beforeEach(function () {
		awsLambda = {
			createFunction: _sinon2["default"].spy(function (parameters, callback) {
				callback();
			})
		};

		akiro = new _libAkiroJs2["default"]({
			branch: "someBranch",
			awsLambda: awsLambda
		});
	});

	describe("(Akiro Lambda Zip File)", function () {
		it("should contain the Akiro packager lambda");
		it("should contain all Akiro packager dependencies");
	});

	it("should create an Akiro lambda function on AWS");
});