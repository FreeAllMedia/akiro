"use strict";

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _libAkiroJs = require("../../lib/akiro.js");

var _libAkiroJs2 = _interopRequireDefault(_libAkiroJs);

var _sinon = require("sinon");

var _sinon2 = _interopRequireDefault(_sinon);

var _helpersMockAwsJs = require("../helpers/mockAws.js");

var _helpersMockAwsJs2 = _interopRequireDefault(_helpersMockAwsJs);

describe("akiro.package(packageList, [localZipFilePath,] callback)", function () {
	var bucketName = undefined,
	    config = undefined,
	    akiro = undefined,
	    callback = undefined;

	beforeEach(function () {
		bucketName = "SomeBucket";

		_helpersMockAwsJs2["default"].reset();

		config = {
			AWS: _helpersMockAwsJs2["default"]
		};

		akiro = new _libAkiroJs2["default"](config);

		akiro["package"];
	});

	it("should invoke the Akiro lambda function on AWS", function () {});

	describe("(When localZipFilePath is provided)", function () {
		it("should download the package zip file to the local path provided");
		it("should include all designated packages in the zip file");
	});

	describe("(When localZipFilePath is NOT provided)", function () {
		it("should return the remote package zip file url via the return data");
		it("should include all designated packages in the zip file");
	});
});