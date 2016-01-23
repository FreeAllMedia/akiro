"use strict";

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _libAkiroBuildersNodejsAkiroBuilderJs = require("../../../../lib/akiro/builders/nodejs/akiroBuilder.js");

var _libAkiroBuildersNodejsAkiroBuilderJs2 = _interopRequireDefault(_libAkiroBuildersNodejsAkiroBuilderJs);

var _sinon = require("sinon");

var _sinon2 = _interopRequireDefault(_sinon);

var _temp = require("temp");

var _temp2 = _interopRequireDefault(_temp);

var _helpersMockExecJs = require("../../../helpers/mockExec.js");

var _helpersMockExecJs2 = _interopRequireDefault(_helpersMockExecJs);

var _helpersMockTempJs = require("../../../helpers/mockTemp.js");

var _helpersMockTempJs2 = _interopRequireDefault(_helpersMockTempJs);

var _fsExtra = require("fs-extra");

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _unzip2 = require("unzip2");

var _unzip22 = _interopRequireDefault(_unzip2);

var _flowsync = require("flowsync");

var _flowsync2 = _interopRequireDefault(_flowsync);

_temp2["default"].track();

describe("AkiroBuilder(event, context)", function () {
	var event = undefined,
	    context = undefined,
	    akiroBuilder = undefined,
	    localFilePath = undefined,
	    nodeModulesDirectoryPath = undefined,
	    temporaryDirectoryPath = undefined,
	    mockExec = undefined,
	    mockNpmPath = undefined,
	    mockTemp = undefined,
	    mockAWS = undefined,
	    mockS3 = undefined,
	    s3ConstructorSpy = undefined;

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
		var _createMockExec;

		event = {
			"package": {
				name: "async",
				version: "1.0.0"
			}
		};

		nodeModulesDirectoryPath = __dirname + "/../../../../../node_modules";

		mockNpmPath = nodeModulesDirectoryPath + "/npm/bin/npm-cli.js";
		mockExec = (0, _helpersMockExecJs2["default"])((_createMockExec = {}, _defineProperty(_createMockExec, "cd " + temporaryDirectoryPath + ";node " + mockNpmPath + " install", function (commandDone) {
			_fsExtra2["default"].copy(nodeModulesDirectoryPath + "/async", temporaryDirectoryPath + "/node_modules/async", function (error) {
				commandDone(error);
			});
		}), _defineProperty(_createMockExec, "cd " + temporaryDirectoryPath + ";node " + mockNpmPath + " init -y", function (execDone) {
			_fsExtra2["default"].copySync(__dirname + "/../../../fixtures/newPackage.json", temporaryDirectoryPath + "/package.json");
			execDone();
		}), _defineProperty(_createMockExec, "npm info .*", function npmInfo(execDone) {
			execDone(null, "1.5.0");
		}), _createMockExec));
		mockTemp = (0, _helpersMockTempJs2["default"])(temporaryDirectoryPath);

		s3ConstructorSpy = _sinon2["default"].spy();

		mockS3 = {
			putObject: _sinon2["default"].spy(function (parameters, callback) {
				callback();
			})
		};

		var MockS3 = function MockS3(config) {
			_classCallCheck(this, MockS3);

			s3ConstructorSpy(config);
			return mockS3;
		};

		mockAWS = {
			S3: MockS3
		};

		localFilePath = temporaryDirectoryPath + "/local.zip";

		context = {
			localFilePath: localFilePath,
			AWS: mockAWS,
			exec: mockExec,
			npmPath: mockNpmPath,
			temp: mockTemp,
			succeed: function succeed(data) {
				done(null, data);
			},
			fail: done
		};

		akiroBuilder = new _libAkiroBuildersNodejsAkiroBuilderJs2["default"](event, context);
		akiroBuilder.invoke(event, context);
	});

	describe("(With context.localFilePath set)", function () {
		it("should copy the .zip file to the designated local file path", function () {
			/* eslint-disable new-cap */
			var zipFixturePath = __dirname + "/../../../fixtures/async-1.0.0.zip";

			var localFilePaths = [];
			var expectedFilePaths = [];
			_flowsync2["default"].series([function (done) {
				_fsExtra2["default"].createReadStream(context.localFilePath).pipe(_unzip22["default"].Parse()).on("entry", function (entry) {
					localFilePaths.push(entry.path);
				}).on("close", done);
			}, function (done) {
				_fsExtra2["default"].createReadStream(zipFixturePath).pipe(_unzip22["default"].Parse()).on("entry", function (entry) {
					expectedFilePaths.push(entry.path);
				}).on("close", done);
			}], function () {
				localFilePaths.should.eql(expectedFilePaths);
			});
		});
	});

	describe("(WITHOUT context.localFilePath set)", function () {
		beforeEach(function (done) {
			_fsExtra2["default"].unlinkSync(localFilePath);
			context.localFilePath = undefined;

			context.succeed = function (data) {
				done(null, data);
			};

			akiroBuilder = new _libAkiroBuildersNodejsAkiroBuilderJs2["default"](event, context);
			akiroBuilder.invoke(event, context);
		});

		it("should not copy the .zip file to a local file path", function () {
			_fsExtra2["default"].existsSync(localFilePath).should.be["false"];
		});
	});
});