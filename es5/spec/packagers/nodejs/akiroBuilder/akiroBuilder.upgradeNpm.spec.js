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

var _node_modulesAsyncPackageJson = require("../../../../../node_modules/async/package.json");

var _node_modulesAsyncPackageJson2 = _interopRequireDefault(_node_modulesAsyncPackageJson);

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
	    mockAWS = undefined,
	    mockS3 = undefined,
	    mockTemp = undefined,
	    succeedData = undefined;

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
			region: "us-east-1",
			bucket: "akiro.test",
			"package": {
				name: "async",
				version: "1.0.0"
			}
		};

		nodeModulesDirectoryPath = __dirname + "/../../../../../node_modules";

		mockNpmPath = nodeModulesDirectoryPath + "/npm/bin/npm-cli.js";
		mockExec = (0, _helpersMockExecJs2["default"])((_createMockExec = {}, _defineProperty(_createMockExec, "npm -g install npm@latest-2", function npmGInstallNpmLatest2(execDone) {
			return execDone();
		}), _defineProperty(_createMockExec, "cd " + temporaryDirectoryPath + ";node " + mockNpmPath + " install", function (execDone) {
			return execDone();
		}), _defineProperty(_createMockExec, "cd " + temporaryDirectoryPath + ";node " + mockNpmPath + " init -y", function (execDone) {
			_fsExtra2["default"].copySync(__dirname + "/../../../fixtures/newPackage.json", temporaryDirectoryPath + "/package.json");
			execDone();
		}), _defineProperty(_createMockExec, "npm info .*", function npmInfo(execDone) {
			execDone(null, event["package"].version);
		}), _createMockExec));

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
			temp: mockTemp,
			npmPath: mockNpmPath,
			succeed: function succeed(data) {
				succeedData = data;
				done();
			}
		};

		akiroBuilder = new _libAkiroBuildersNodejsAkiroBuilderJs2["default"](event, context);
		akiroBuilder.invoke(event, context);
	});

	it("should upgrade npm to 2.x", function () {
		mockExec.calledWith("npm -g install npm@latest-2").should.be["true"];
	});
});