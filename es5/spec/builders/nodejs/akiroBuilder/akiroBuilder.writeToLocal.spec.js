"use strict";

var _akiroBuilder = require("../../../../lib/akiro/builders/nodejs/akiroBuilder.js");

var _akiroBuilder2 = _interopRequireDefault(_akiroBuilder);

var _sinon = require("sinon");

var _sinon2 = _interopRequireDefault(_sinon);

var _temp = require("temp");

var _temp2 = _interopRequireDefault(_temp);

var _mockExec = require("../../../helpers/mockExec.js");

var _mockExec2 = _interopRequireDefault(_mockExec);

var _mockTemp = require("../../../helpers/mockTemp.js");

var _mockTemp2 = _interopRequireDefault(_mockTemp);

var _fsExtra = require("fs-extra");

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _unzip = require("unzip2");

var _unzip2 = _interopRequireDefault(_unzip);

var _flowsync = require("flowsync");

var _flowsync2 = _interopRequireDefault(_flowsync);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

_temp2.default.track();

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
		_temp2.default.mkdir("akiroBuilder", function (error, newTemporaryDirectoryPath) {
			temporaryDirectoryPath = newTemporaryDirectoryPath;
			done();
		});
	});

	afterEach(function (done) {
		_temp2.default.cleanup(done);
	});

	beforeEach(function (done) {
		var _createMockExec;

		event = {
			package: {
				name: "async",
				version: "1.0.0"
			}
		};

		nodeModulesDirectoryPath = _path2.default.normalize(__dirname + "/../../../../../node_modules");

		mockNpmPath = nodeModulesDirectoryPath + "/npm/bin/npm-cli.js";
		mockExec = (0, _mockExec2.default)((_createMockExec = {}, _defineProperty(_createMockExec, "cd " + temporaryDirectoryPath + ";node " + mockNpmPath + " install", function undefined(commandDone) {
			_fsExtra2.default.copy(nodeModulesDirectoryPath + "/async", temporaryDirectoryPath + "/node_modules/async", function (error) {
				commandDone(error);
			});
		}), _defineProperty(_createMockExec, "cd " + temporaryDirectoryPath + ";node " + mockNpmPath + " init -y", function undefined(execDone) {
			_fsExtra2.default.copySync(__dirname + "/../../../fixtures/newPackage.json", temporaryDirectoryPath + "/package.json");
			execDone();
		}), _defineProperty(_createMockExec, "node " + mockNpmPath + " info .*", function undefined(execDone) {
			execDone(null, "1.5.0");
		}), _createMockExec));
		mockTemp = (0, _mockTemp2.default)(temporaryDirectoryPath);

		s3ConstructorSpy = _sinon2.default.spy();

		mockS3 = {
			putObject: _sinon2.default.spy(function (parameters, callback) {
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

		akiroBuilder = new _akiroBuilder2.default(event, context);
		akiroBuilder.invoke(event, context);
	});

	describe("(With context.localFilePath set)", function () {
		it("should copy the .zip file to the designated local file path", function () {
			/* eslint-disable new-cap */
			var zipFixturePath = __dirname + "/../../../fixtures/async-1.5.2.zip";

			var localFilePaths = [];
			var expectedFilePaths = [];
			_flowsync2.default.series([function (done) {
				_fsExtra2.default.createReadStream(context.localFilePath).pipe(_unzip2.default.Parse()).on("entry", function (entry) {
					localFilePaths.push(entry.path);
				}).on("close", done);
			}, function (done) {
				_fsExtra2.default.createReadStream(zipFixturePath).pipe(_unzip2.default.Parse()).on("entry", function (entry) {
					expectedFilePaths.push(entry.path);
				}).on("close", done);
			}], function () {
				localFilePaths.should.eql(expectedFilePaths);
			});
		});
	});

	describe("(WITHOUT context.localFilePath set)", function () {
		beforeEach(function (done) {
			_fsExtra2.default.unlinkSync(localFilePath);
			context.localFilePath = undefined;

			context.succeed = function (data) {
				done(null, data);
			};

			akiroBuilder = new _akiroBuilder2.default(event, context);
			akiroBuilder.invoke(event, context);
		});

		it("should not copy the .zip file to a local file path", function () {
			_fsExtra2.default.existsSync(localFilePath).should.be.false;
		});
	});
});