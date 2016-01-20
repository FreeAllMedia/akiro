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

var _packageJson = require("../../../../../package.json");

var _packageJson2 = _interopRequireDefault(_packageJson);

var _fsExtra = require("fs-extra");

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _helpersMockExecJs = require("../../../helpers/mockExec.js");

var _helpersMockExecJs2 = _interopRequireDefault(_helpersMockExecJs);

var _helpersMockTempJs = require("../../../helpers/mockTemp.js");

var _helpersMockTempJs2 = _interopRequireDefault(_helpersMockTempJs);

var _glob = require("glob");

var _glob2 = _interopRequireDefault(_glob);

var _unzip2 = require("unzip2");

var _unzip22 = _interopRequireDefault(_unzip2);

var _arrayDifference = require("array-difference");

var _arrayDifference2 = _interopRequireDefault(_arrayDifference);

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
	    mockS3 = undefined;

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
		mockExec = (0, _helpersMockExecJs2["default"])(_defineProperty({}, "cd " + temporaryDirectoryPath + ";node " + mockNpmPath + " init -y", function (commandDone) {
			_fsExtra2["default"].copySync(__dirname + "/../../../fixtures/newPackage.json", temporaryDirectoryPath + "/package.json");
			commandDone();
		}));
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

		akiroBuilder = new _libAkiroBuildersNodejsAkiroBuilderJs2["default"](event, context);
		akiroBuilder.invoke(event, context);
	});

	it("should add all designated package code to a .zip file", function (done) {
		/* eslint-disable new-cap */

		var zipFilePath = temporaryDirectoryPath + "/package.zip";

		var asyncFilePaths = _glob2["default"].sync(temporaryDirectoryPath + "/node_modules/async/**/*", { dot: true });
		var npmFilePaths = _glob2["default"].sync(temporaryDirectoryPath + "/node_modules/npm/**/*", { dot: true });

		asyncFilePaths = asyncFilePaths.filter(filterDirectories);
		npmFilePaths = npmFilePaths.filter(filterDirectories);

		function filterDirectories(filePath) {
			return !_fsExtra2["default"].statSync(filePath).isDirectory();
		}

		var expectedFilePaths = asyncFilePaths.concat(npmFilePaths);
		expectedFilePaths = expectedFilePaths.map(function (filePath) {
			var relativePath = filePath.replace(temporaryDirectoryPath + "/node_modules/", "");
			return relativePath;
		});

		var filePaths = [];
		_fsExtra2["default"].createReadStream(zipFilePath).pipe(_unzip22["default"].Parse()).on("entry", function (entry) {
			filePaths.push(entry.path);
		}).on("close", function () {
			(0, _arrayDifference2["default"])(expectedFilePaths, filePaths).should.eql([]);
			done();
		});
	});
});