"use strict";

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _libAkiroJs = require("../../../lib/akiro.js");

var _libAkiroJs2 = _interopRequireDefault(_libAkiroJs);

var _temp = require("temp");

var _temp2 = _interopRequireDefault(_temp);

var _sinon = require("sinon");

var _sinon2 = _interopRequireDefault(_sinon);

var _flowsync = require("flowsync");

var _flowsync2 = _interopRequireDefault(_flowsync);

var _glob = require("glob");

var _glob2 = _interopRequireDefault(_glob);

var _fsExtra = require("fs-extra");

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

_temp2["default"].track();

describe("akiro.package(packageDetails, outputDirectoryPath, callback)", function () {
	var config = undefined,
	    akiro = undefined,
	    packageDetails = undefined,
	    cacheDirectoryPath = undefined,
	    outputDirectoryPath = undefined,
	    asyncZipFileName = undefined,
	    asyncZipFilePath = undefined,
	    mockAsync = undefined,
	    mockAWS = undefined,
	    mockS3 = undefined,
	    mockLambda = undefined,
	    lambdaConstructorSpy = undefined,
	    s3ConstructorSpy = undefined;

	beforeEach(function (done) {

		packageDetails = {
			"async": "1.x.x",
			"incognito": "0.1.4"
		};

		outputDirectoryPath = _temp2["default"].mkdirSync("akiro.output");
		cacheDirectoryPath = _temp2["default"].mkdirSync("akiro.cache");

		lambdaConstructorSpy = _sinon2["default"].spy();
		s3ConstructorSpy = _sinon2["default"].spy();

		mockAsync = {
			parallel: _sinon2["default"].spy(_flowsync2["default"].parallel)
		};

		mockLambda = {
			invoke: _sinon2["default"].spy(function (parameters, invokeCallback) {
				var payloadData = JSON.parse(parameters.Payload);
				var packageName = payloadData["package"].name;
				var packageVersion = payloadData["package"].version;

				invokeCallback(null, {
					fileName: packageName + "-" + packageVersion + ".zip"
				});
			})
		};

		asyncZipFileName = "async-1.5.2.zip";
		asyncZipFilePath = __dirname + "/../../fixtures/" + asyncZipFileName;

		var mockS3GetObjectAsyncRequest = {
			createReadStream: function createReadStream() {
				return _fsExtra2["default"].createReadStream(asyncZipFilePath);
			}
		};

		var mockS3GetObjectIncognitoRequest = {
			createReadStream: function createReadStream() {
				return _fsExtra2["default"].createReadStream(__dirname + "/../../fixtures/incognito-0.1.4.zip");
			}
		};

		mockS3 = {
			getObject: _sinon2["default"].spy(function (parameters) {
				switch (parameters.Key) {
					case "async-1.5.2.zip":
						return mockS3GetObjectAsyncRequest;
					case "incognito-0.1.4.zip":
						return mockS3GetObjectIncognitoRequest;
					default:
						throw parameters.Key;
				}
			})
		};

		var MockS3 = function MockS3(s3Config) {
			_classCallCheck(this, MockS3);

			s3ConstructorSpy(s3Config);
			return mockS3;
		};

		var MockLambda = function MockLambda(lambdaConfig) {
			_classCallCheck(this, MockLambda);

			lambdaConstructorSpy(lambdaConfig);
			return mockLambda;
		};

		mockAWS = {
			S3: MockS3,
			Lambda: MockLambda
		};

		config = {
			region: "us-east-1",
			bucket: "akiro.test",
			AWS: mockAWS,
			Async: mockAsync,
			cacheDirectoryPath: cacheDirectoryPath
		};

		_fsExtra2["default"].copySync(asyncZipFilePath, cacheDirectoryPath + "/" + asyncZipFileName);
		akiro = new _libAkiroJs2["default"](config);
		akiro["package"](packageDetails, outputDirectoryPath, done);
	});

	describe("(When some local cached versions are available)", function () {
		it("should not invoke the package lambda for the cached versions", function () {
			var expectedParameters = {
				FunctionName: "AkiroBuilder", /* required */
				Payload: JSON.stringify({
					bucket: config.bucket,
					region: config.region,
					"package": {
						name: "async",
						version: packageDetails.async
					}
				})
			};
			mockLambda.invoke.calledWith(expectedParameters).should.be["false"];
		});

		it("should not download the package from S3 for the cached versions", function () {
			var expectedParameters = {
				Bucket: config.bucket,
				Key: "async-1.5.2.zip"
			};
			mockS3.getObject.calledWith(expectedParameters).should.be["false"];
		});

		it("should copy all package files to the output directory", function () {
			var outputDirectoryFilePaths = _glob2["default"].sync(outputDirectoryPath + "/**/*", { dot: true }).map(function (filePath) {
				return filePath.replace(outputDirectoryPath, "");
			});

			var fixturesOutputDirectoryPath = _path2["default"].normalize(__dirname + "/../../fixtures/output");
			var expectedFilePaths = _glob2["default"].sync(fixturesOutputDirectoryPath + "/**/*", { dot: true }).map(function (filePath) {
				return filePath.replace(fixturesOutputDirectoryPath, "");
			});

			outputDirectoryFilePaths.should.eql(expectedFilePaths);
		});
	});
});