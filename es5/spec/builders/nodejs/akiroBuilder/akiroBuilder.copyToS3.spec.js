"use strict";

var _akiroBuilder = require("../../../../lib/akiro/builders/nodejs/akiroBuilder.js");

var _akiroBuilder2 = _interopRequireDefault(_akiroBuilder);

var _sinon = require("sinon");

var _sinon2 = _interopRequireDefault(_sinon);

var _temp = require("temp");

var _temp2 = _interopRequireDefault(_temp);

var _package = require("../../../../../node_modules/async/package.json");

var _package2 = _interopRequireDefault(_package);

var _mockExec = require("../../../helpers/mockExec.js");

var _mockExec2 = _interopRequireDefault(_mockExec);

var _mockTemp = require("../../../helpers/mockTemp.js");

var _mockTemp2 = _interopRequireDefault(_mockTemp);

var _fsExtra = require("fs-extra");

var _fsExtra2 = _interopRequireDefault(_fsExtra);

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
			region: "us-east-1",
			bucket: "akiro.test",
			package: {
				name: "async",
				version: "1.0.0"
			}
		};

		nodeModulesDirectoryPath = _path2.default.normalize(__dirname + "/../../../../../node_modules");

		mockNpmPath = nodeModulesDirectoryPath + "/npm/bin/npm-cli.js";
		mockExec = (0, _mockExec2.default)((_createMockExec = {}, _defineProperty(_createMockExec, "cd " + temporaryDirectoryPath + ";node " + mockNpmPath + " install", function undefined(execDone) {
			return execDone();
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

		context = {
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

	describe("(With event.bucket and event.region set)", function () {
		it("should instantiate S3 with the designated region", function () {
			s3ConstructorSpy.calledWith({
				region: event.region
			}).should.be.true;
		});

		it("should copy the .zip file to the designated S3 options", function () {
			var zipFileName = event.package.name + "-" + _package2.default.version + ".zip";
			var zipFileData = _fsExtra2.default.readFileSync(__dirname + "/../../../fixtures/async-1.5.2.zip");
			var putObjectParameters = {
				Bucket: event.bucket,
				Key: zipFileName,
				Body: zipFileData
			};
			mockS3.putObject.calledWith(putObjectParameters);
		});
	});

	describe("(WITHOUT event.bucket or event.region set)", function () {
		beforeEach(function (done) {
			event.region = undefined;
			event.bucket = undefined;

			context.succeed = function (data) {
				done(null, data);
			};

			akiroBuilder = new _akiroBuilder2.default(event, context);
			akiroBuilder.invoke(event, context);
		});

		it("should NOT instantiate S3 with the designated region", function () {
			s3ConstructorSpy.calledWith({
				region: event.region
			}).should.be.false;
		});
	});
});