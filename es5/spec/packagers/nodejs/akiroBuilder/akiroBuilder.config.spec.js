"use strict";

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _libAkiroBuildersNodejsAkiroBuilderJs = require("../../../../lib/akiro/builders/nodejs/akiroBuilder.js");

var _libAkiroBuildersNodejsAkiroBuilderJs2 = _interopRequireDefault(_libAkiroBuildersNodejsAkiroBuilderJs);

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

var _fsExtra = require("fs-extra");

var _fsExtra2 = _interopRequireDefault(_fsExtra);

_temp2["default"].track();

describe("AkiroBuilder(event, context)", function () {
	var event = undefined,
	    context = undefined,
	    akiroBuilder = undefined,
	    nodeModulesDirectoryPath = undefined,
	    temporaryDirectoryPath = undefined,
	    mockExec = undefined,
	    mockNpmPath = undefined,
	    mockTemp = undefined,
	    mockAWS = undefined,
	    mockS3 = undefined,
	    mockFileSystem = undefined;

	beforeEach(function (done) {
		_temp2["default"].mkdir("akiroBuilder", function (error, newTemporaryDirectoryPath) {
			temporaryDirectoryPath = newTemporaryDirectoryPath;
			done();
		});
	});

	afterEach(function (done) {
		_temp2["default"].cleanup(done);
	});

	beforeEach(function (done) {
		event = {
			region: "us-east-1",
			"package": {
				name: "async",
				version: _packageJson2["default"].dependencies.async
			}
		};

		nodeModulesDirectoryPath = __dirname + "/../../../../../node_modules";

		mockNpmPath = nodeModulesDirectoryPath + "/npm/bin/npm-cli.js";
		mockExec = (0, _helpersMockExecJs2["default"])(temporaryDirectoryPath, nodeModulesDirectoryPath, mockNpmPath);
		mockTemp = (0, _helpersMockTempJs2["default"])(temporaryDirectoryPath);
		mockFileSystem = {
			writeFile: _sinon2["default"].spy(_fsExtra2["default"].writeFile),
			statSync: _sinon2["default"].spy(_fsExtra2["default"].statSync),
			createReadStream: _sinon2["default"].spy(_fsExtra2["default"].createReadStream),
			createWriteStream: _sinon2["default"].spy(_fsExtra2["default"].createWriteStream),
			copy: _sinon2["default"].spy(_fsExtra2["default"].copy)
		};

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
			fileSystem: mockFileSystem,
			succeed: done,
			fail: done
		};

		akiroBuilder = new _libAkiroBuildersNodejsAkiroBuilderJs2["default"](event, context);
		akiroBuilder.invoke(event, context);
	});

	describe("akiroBuilder.temp", function () {
		it("should be set to context.temp if provided", function () {
			akiroBuilder.temp.should.eql(mockTemp);
		});

		it("should be set to the temp package if not provided", function () {
			context.temp = undefined;
			akiroBuilder = new _libAkiroBuildersNodejsAkiroBuilderJs2["default"](event, context);
			akiroBuilder.temp.should.eql(_temp2["default"]);
		});
	});

	describe("akiroBuilder.npmPath", function () {
		it("should be set to context.npmPath if provided", function () {
			akiroBuilder.npmPath.should.eql(mockNpmPath);
		});

		it("should be set to the npmPath package if not provided", function () {
			context.npmPath = undefined;
			akiroBuilder = new _libAkiroBuildersNodejsAkiroBuilderJs2["default"](event, context);
			akiroBuilder.npmPath.should.eql("./node_modules/npm/bin/npm-cli.js");
		});
	});

	describe("akiroBuilder.exec", function () {
		it("should be set to context.exec if provided", function () {
			akiroBuilder.exec.should.eql(mockExec);
		});

		it("should be set to the exec package if not provided", function () {
			context.exec = undefined;
			akiroBuilder = new _libAkiroBuildersNodejsAkiroBuilderJs2["default"](event, context);
			akiroBuilder.exec.should.eql(_child_process.exec);
		});
	});

	describe("akiroBuilder.AWS", function () {
		it("should be set to context.AWS if provided", function () {
			akiroBuilder.AWS.should.eql(mockAWS);
		});

		it("should be set to the AWS package if not provided", function () {
			context.AWS = undefined;
			akiroBuilder = new _libAkiroBuildersNodejsAkiroBuilderJs2["default"](event, context);
			akiroBuilder.AWS.should.eql(_awsSdk2["default"]);
		});
	});

	describe("akiroBuilder.fileSystem", function () {
		it("should be set to context.fileSystem if provided", function () {
			akiroBuilder.fileSystem.should.eql(mockFileSystem);
		});

		it("should be set to the fileSystem package if not provided", function () {
			context.fileSystem = undefined;
			akiroBuilder = new _libAkiroBuildersNodejsAkiroBuilderJs2["default"](event, context);
			akiroBuilder.fileSystem.should.eql(_fsExtra2["default"]);
		});
	});
});