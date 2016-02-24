"use strict";

var _akiro = require("../../../lib/akiro.js");

var _akiro2 = _interopRequireDefault(_akiro);

var _temp = require("temp");

var _temp2 = _interopRequireDefault(_temp);

var _sinon = require("sinon");

var _sinon2 = _interopRequireDefault(_sinon);

var _flowsync = require("flowsync");

var _flowsync2 = _interopRequireDefault(_flowsync);

var _fsExtra = require("fs-extra");

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

_temp2.default.track();

describe("akiro.package(packageDetails, outputDirectoryPath, callback)", function () {
	var config = undefined,
	    akiro = undefined,
	    error = undefined,
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

		outputDirectoryPath = _path2.default.normalize(__dirname + "/../../../../temp"); //temp.mkdirSync("akiro.output");
		cacheDirectoryPath = "" + _temp2.default.mkdirSync("akiro.cache");

		lambdaConstructorSpy = _sinon2.default.spy();
		s3ConstructorSpy = _sinon2.default.spy();

		mockAsync = {
			parallel: _sinon2.default.spy(_flowsync2.default.parallel)
		};

		mockLambda = {
			invoke: _sinon2.default.spy(function (parameters, invokeCallback) {
				invokeCallback(new Error());
			})
		};

		asyncZipFileName = "async-1.5.2.zip";
		asyncZipFilePath = __dirname + "/../../fixtures/" + asyncZipFileName;

		var mockS3GetObjectAsyncRequest = {
			createReadStream: function createReadStream() {
				return _fsExtra2.default.createReadStream(asyncZipFilePath);
			}
		};

		var mockS3GetObjectIncognitoRequest = {
			createReadStream: function createReadStream() {
				return _fsExtra2.default.createReadStream(__dirname + "/../../fixtures/incognito-0.1.4.zip");
			}
		};

		mockS3 = {
			getObject: _sinon2.default.spy(function (parameters) {
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

		akiro = new _akiro2.default(config);

		akiro.package(packageDetails, outputDirectoryPath, function (packageError) {
			error = packageError;
			done();
		});
	});

	describe("(When an Akiro Builder Lambda invoke fails)", function () {
		it("should return the error", function () {
			error.should.be.instanceOf(Error);
		});
	});
});