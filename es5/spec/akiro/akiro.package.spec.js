"use strict";

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _libAkiroJs = require("../../lib/akiro.js");

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

// temp.track();

describe("akiro.package(packageDetails, outputDirectoryPath, callback)", function () {
	var config = undefined,
	    akiro = undefined,
	    callback = undefined,
	    packageDetails = undefined,
	    cacheDirectoryPath = undefined,
	    outputDirectoryPath = undefined,
	    mockAsync = undefined,
	    mockAWS = undefined,
	    mockS3 = undefined,
	    mockLambda = undefined,
	    lambdaConstructorSpy = undefined,
	    s3ConstructorSpy = undefined;

	beforeEach(function (done) {
		packageDetails = {
			"async": "1.0.0",
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

		var mockS3GetObjectAsyncRequest = {
			createReadStream: function createReadStream() {
				return _fsExtra2["default"].createReadStream(__dirname + "/../fixtures/async-1.0.0.zip");
			}
		};

		var mockS3GetObjectIncognitoRequest = {
			createReadStream: function createReadStream() {
				return _fsExtra2["default"].createReadStream(__dirname + "/../fixtures/incognito-0.1.4.zip");
			}
		};

		mockS3 = {
			getObject: _sinon2["default"].spy(function (parameters) {
				switch (parameters.Key) {
					case "async-1.0.0.zip":
						return mockS3GetObjectAsyncRequest;
					case "incognito-0.1.4.zip":
						return mockS3GetObjectIncognitoRequest;
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

		akiro = new _libAkiroJs2["default"](config);

		callback = done;
		akiro["package"](packageDetails, outputDirectoryPath, callback);
	});

	it("should instantiate Lambda with the designated region", function () {
		lambdaConstructorSpy.calledWith({
			region: config.region
		}).should.be["true"];
	});

	it("should instantiate S3 with the designated region", function () {
		s3ConstructorSpy.calledWith({
			region: config.region
		}).should.be["true"];
	});

	describe("(Lambda Invoking)", function () {
		it("should invoke the Akiro Builder lambda functions in parallel", function () {
			mockAsync.parallel.called.should.be["true"];
		});

		it("should invoke the Akiro Builder lambda function on AWS for each dependency (mock One)", function () {
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
			mockLambda.invoke.firstCall.args[0].should.eql(expectedParameters);
		});

		it("should invoke the Akiro Builder lambda function on AWS for each dependency (mock Two)", function () {
			var expectedParameters = {
				FunctionName: "AkiroBuilder", /* required */
				Payload: JSON.stringify({
					bucket: config.bucket,
					region: config.region,
					"package": {
						name: "incognito",
						version: packageDetails.incognito
					}
				})
			};
			mockLambda.invoke.secondCall.args[0].should.eql(expectedParameters);
		});
	});

	describe("(When an Akiro Builder Lambda invoke fails)", function () {
		var error = undefined;

		beforeEach(function (done) {
			mockLambda.invoke = function (parameters, invokeCallback) {
				invokeCallback(new Error());
			};

			akiro["package"](packageDetails, outputDirectoryPath, function (packageError) {
				error = packageError;
				done();
			});
		});

		it("should return the error", function () {
			error.should.be.instanceOf(Error);
		});
	});

	describe("(When a local cached version is not available)", function () {
		it("should download each zipped package file in parallel", function () {
			mockAsync.parallel.calledTwice.should.be["true"];
		});

		describe("(Mock Package One)", function () {
			var fileName = undefined;

			beforeEach(function () {
				fileName = "async-1.0.0.zip";
			});

			it("should call S3 for the correct package zip file", function () {
				var expectedParameters = {
					Bucket: config.bucket,
					Key: fileName
				};

				mockS3.getObject.calledWith(expectedParameters).should.be["true"];
			});

			it("should download each zipped package files to the akiro cache directory", function () {
				_fsExtra2["default"].existsSync(cacheDirectoryPath + "/" + fileName).should.be["true"];
			});
		});

		describe("(Mock Package Two)", function () {
			var fileName = undefined;

			beforeEach(function () {
				fileName = "incognito-0.1.4.zip";
			});

			it("should call S3 for the correct package zip file", function () {
				var expectedParameters = {
					Bucket: config.bucket,
					Key: fileName
				};

				mockS3.getObject.calledWith(expectedParameters).should.be["true"];
			});

			it("should download each zipped package files to the akiro cache directory", function () {
				_fsExtra2["default"].existsSync(cacheDirectoryPath + "/" + fileName).should.be["true"];
			});
		});

		it("should unzip each package file in parallel", function () {
			mockAsync.parallel.calledThrice.should.be["true"];
		});

		it("should copy the unzipped package files to the outputDirectoryPath provided", function () {
			var outputDirectoryFilePaths = _glob2["default"].sync(outputDirectoryPath).map(function (filePath) {
				return filePath.replace(outputDirectoryPath, "");
			});

			var fixturesOutputDirectoryPath = _path2["default"].normalize(__dirname + "/../fixtures/output");
			var expectedFilePaths = _glob2["default"].sync(fixturesOutputDirectoryPath + "/**/*", { dot: true }).map(function (filePath) {
				return filePath.replace(fixturesOutputDirectoryPath, "");
			});

			outputDirectoryFilePaths.should.eql(expectedFilePaths);
		});
	});

	describe("(When a local cached version is available)", function () {
		it("should copy the package files to the output directory from the cached .zip files");
	});
});