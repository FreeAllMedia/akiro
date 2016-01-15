"use strict";

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _libAkiroPackagersNodejsAkiroPackagerJs = require("../../../lib/akiro/packagers/nodejs/akiroPackager.js");

var _libAkiroPackagersNodejsAkiroPackagerJs2 = _interopRequireDefault(_libAkiroPackagersNodejsAkiroPackagerJs);

var _sinon = require("sinon");

var _sinon2 = _interopRequireDefault(_sinon);

var _temp = require("temp");

var _temp2 = _interopRequireDefault(_temp);

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

_temp2["default"].track();

describe("AkiroPackager(event, context)", function () {
	var event = undefined,
	    context = undefined,
	    akiroPackager = undefined,
	    results = undefined,
	    temporaryDirectoryPath = undefined,
	    mockNpmPath = undefined,
	    mockTemp = undefined;

	beforeEach(function (done) {
		_temp2["default"].mkdir("akiroPackager", function (error, newTemporaryDirectoryPath) {
			temporaryDirectoryPath = newTemporaryDirectoryPath;
			done();
		});
	});

	// afterEach(done => {
	// 	temp.cleanup(done);
	// });

	beforeEach(function (done) {
		event = {};

		mockNpmPath = __dirname + "/../../../../node_modules/npm";

		mockTemp = {
			mkdir: _sinon2["default"].spy(function (directoryName, callback) {
				callback(null, temporaryDirectoryPath);
			})
		};

		context = {
			npmPath: mockNpmPath,
			temp: mockTemp,
			succeed: function succeed(succeedResults) {
				results = succeedResults;
				done();
			}
		};

		akiroPackager = new _libAkiroPackagersNodejsAkiroPackagerJs2["default"](event, context);
		akiroPackager.invoke(event, context);
	});

	describe("akiroPackager.temp", function () {
		it("should be set to context.temp if provided", function () {
			akiroPackager.temp.should.eql(mockTemp);
		});

		it("should be set to the temp package if not provided", function () {
			context = {};
			akiroPackager = new _libAkiroPackagersNodejsAkiroPackagerJs2["default"](event, context);
			akiroPackager.temp.should.eql(_temp2["default"]);
		});
	});

	describe("akiroPackager.npmPath", function () {
		it("should be set to context.npmPath if provided", function () {
			akiroPackager.npmPath.should.eql(mockNpmPath);
		});

		it("should be set to the npmPath package if not provided", function () {
			context = {};
			akiroPackager = new _libAkiroPackagersNodejsAkiroPackagerJs2["default"](event, context);
			akiroPackager.npmPath.should.eql("./node_modules/npm");
		});
	});

	describe("(Temporary Directory)", function () {
		it("should create a temporary 'akiroPackager' directory", function () {
			mockTemp.mkdir.firstCall.args[0].should.eql("akiroPackager");
		});

		it("should return any errors from creating the temporary directory", function () {
			var expectedError = new Error();

			context = {
				temp: mockTemp,
				fail: function fail(failError) {
					failError.should.eql(expectedError);
				}
			};

			mockTemp.mkdir = _sinon2["default"].spy(function (directoryName, callback) {
				callback(expectedError);
			});

			akiroPackager = new _libAkiroPackagersNodejsAkiroPackagerJs2["default"](event, context);
			akiroPackager.invoke(event, context);
		});
	});

	it("should copy ./node_modules/npm to the temporary directory", function () {
		var npmFileNames = _fs2["default"].readdirSync(temporaryDirectoryPath + "/node_modules/npm");
		var expectedNpmFileNames = _fs2["default"].readdirSync(__dirname + "/../../../../node_modules/npm");

		npmFileNames.should.have.members(expectedNpmFileNames);
	});

	it("should create an empty package.json to satisfy npm");
	it("should use npm to install and build all designated packages");
	it("should add all designated package code to a .zip file");
	it("should copy the .zip file to the designated S3 bucket");
	it("should copy the .zip file to the designated S3 key");
});