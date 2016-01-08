"use strict";

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _libAkiroJs = require("../../lib/akiro.js");

var _libAkiroJs2 = _interopRequireDefault(_libAkiroJs);

var _sinon = require("sinon");

var _sinon2 = _interopRequireDefault(_sinon);

var _temp = require("temp");

var _temp2 = _interopRequireDefault(_temp);

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _unzip2 = require("unzip2");

var _unzip22 = _interopRequireDefault(_unzip2);

describe("akiro.build(filePath, callback)", function () {
	var akiro = undefined,
	    filePath = undefined,
	    callback = undefined;

	beforeEach(function (done) {
		_temp2["default"].track();

		var config = {};

		akiro = new _libAkiroJs2["default"](config);

		_temp2["default"].mkdir("akiro_build", function (error, tempDirectoryPath) {
			filePath = tempDirectoryPath + "/akiro.builder.zip";
			akiro.build(filePath, done);
		});
	});

	afterEach(function (done) {
		_temp2["default"].cleanup(done);
	});

	it("should build an Akiro deployment zip file", function () {
		_fs2["default"].existsSync(filePath).should.be["true"];
	});

	describe("(Zip File)", function () {
		it("should contain the Akiro packager lambda", function () {});
		it("should contain all Akiro packager dependencies");
	});
});