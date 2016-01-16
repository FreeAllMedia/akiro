"use strict";

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _libAkiroPackagersNodejsAkiroPackagerJs = require("../../../../lib/akiro/packagers/nodejs/akiroPackager.js");

var _libAkiroPackagersNodejsAkiroPackagerJs2 = _interopRequireDefault(_libAkiroPackagersNodejsAkiroPackagerJs);

var _sinon = require("sinon");

var _sinon2 = _interopRequireDefault(_sinon);

var _temp = require("temp");

var _temp2 = _interopRequireDefault(_temp);

var _child_process = require("child_process");

var _packageJson = require("../../../../../package.json");

var _packageJson2 = _interopRequireDefault(_packageJson);

var _awsSdk = require("aws-sdk");

var _awsSdk2 = _interopRequireDefault(_awsSdk);

var _helpersMockExecJs = require("../../../helpers/mockExec.js");

var _helpersMockExecJs2 = _interopRequireDefault(_helpersMockExecJs);

var _helpersMockTempJs = require("../../../helpers/mockTemp.js");

var _helpersMockTempJs2 = _interopRequireDefault(_helpersMockTempJs);

_temp2["default"].track();

describe("AkiroPackager(event, context)", function () {
	var event = undefined,
	    context = undefined,
	    akiroPackager = undefined,
	    nodeModulesDirectoryPath = undefined,
	    temporaryDirectoryPath = undefined,
	    mockExec = undefined,
	    mockNpmPath = undefined,
	    mockTemp = undefined,
	    mockAWS = undefined,
	    mockS3 = undefined;

	beforeEach(function (done) {
		_temp2["default"].mkdir("akiroPackager", function (error, newTemporaryDirectoryPath) {
			temporaryDirectoryPath = newTemporaryDirectoryPath;
			done();
		});
	});

	afterEach(function (done) {
		_temp2["default"].cleanup(done);
	});

	beforeEach(function (done) {
		this.timeout(60000);

		event = {
			region: "us-east-1",
			"package": {
				name: "async",
				version: _packageJson2["default"].dependencies.async
			}
		};

		nodeModulesDirectoryPath = __dirname + "/../../../../../node_modules";

		mockExec = (0, _helpersMockExecJs2["default"])(temporaryDirectoryPath, nodeModulesDirectoryPath);
		mockNpmPath = nodeModulesDirectoryPath + "/npm";
		mockTemp = (0, _helpersMockTempJs2["default"])(temporaryDirectoryPath);

		mockS3 = {
			putObject: _sinon2["default"].spy(function (parameters, callback) {
				callback();
			})
		};

		var MockS3 = function MockS3() {
			_classCallCheck(this, MockS3);

			return mockS3;
		};

		mockAWS = {
			S3: MockS3
		};

		context = {
			AWS: mockAWS,
			exec: mockExec,
			npmPath: mockNpmPath,
			temp: mockTemp,
			succeed: done,
			fail: done
		};

		akiroPackager = new _libAkiroPackagersNodejsAkiroPackagerJs2["default"](event, context);
		akiroPackager.invoke(event, context);
	});

	describe("akiroPackager.temp", function () {
		it("should be set to context.temp if provided", function () {
			akiroPackager.temp.should.eql(mockTemp);
		});

		it("should be set to the temp package if not provided", function () {
			context.temp = undefined;
			akiroPackager = new _libAkiroPackagersNodejsAkiroPackagerJs2["default"](event, context);
			akiroPackager.temp.should.eql(_temp2["default"]);
		});
	});

	describe("akiroPackager.npmPath", function () {
		it("should be set to context.npmPath if provided", function () {
			akiroPackager.npmPath.should.eql(mockNpmPath);
		});

		it("should be set to the npmPath package if not provided", function () {
			context.npmPath = undefined;
			akiroPackager = new _libAkiroPackagersNodejsAkiroPackagerJs2["default"](event, context);
			akiroPackager.npmPath.should.eql("./node_modules/npm");
		});
	});

	describe("akiroPackager.exec", function () {
		it("should be set to context.exec if provided", function () {
			akiroPackager.exec.should.eql(mockExec);
		});

		it("should be set to the exec package if not provided", function () {
			context.exec = undefined;
			akiroPackager = new _libAkiroPackagersNodejsAkiroPackagerJs2["default"](event, context);
			akiroPackager.exec.should.eql(_child_process.exec);
		});
	});

	describe("akiroPackager.AWS", function () {
		it("should be set to context.AWS if provided", function () {
			akiroPackager.AWS.should.eql(mockAWS);
		});

		it("should be set to the AWS package if not provided", function () {
			context.AWS = undefined;
			akiroPackager = new _libAkiroPackagersNodejsAkiroPackagerJs2["default"](event, context);
			akiroPackager.AWS.should.eql(_awsSdk2["default"]);
		});
	});
});