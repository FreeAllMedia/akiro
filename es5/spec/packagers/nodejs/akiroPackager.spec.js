"use strict";

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _libAkiroPackagersNodejsAkiroPackagerJs = require("../../../lib/akiro/packagers/nodejs/akiroPackager.js");

var _libAkiroPackagersNodejsAkiroPackagerJs2 = _interopRequireDefault(_libAkiroPackagersNodejsAkiroPackagerJs);

var _sinon = require("sinon");

var _sinon2 = _interopRequireDefault(_sinon);

var _temp = require("temp");

var _temp2 = _interopRequireDefault(_temp);

var _fsExtra = require("fs-extra");

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _child_process = require("child_process");

var _packageJson = require("../../../../package.json");

var _packageJson2 = _interopRequireDefault(_packageJson);

var _unzip2 = require("unzip2");

var _unzip22 = _interopRequireDefault(_unzip2);

var _glob = require("glob");

var _glob2 = _interopRequireDefault(_glob);

var _arrayDifference = require("array-difference");

var _arrayDifference2 = _interopRequireDefault(_arrayDifference);

var _awsSdk = require("aws-sdk");

var _awsSdk2 = _interopRequireDefault(_awsSdk);

_temp2["default"].track();

describe("AkiroPackager(event, context)", function () {
	var event = undefined,
	    context = undefined,
	    akiroPackager = undefined,
	    results = undefined,
	    nodeModulesDirectoryPath = undefined,
	    temporaryDirectoryPath = undefined,
	    mockExec = undefined,
	    mockNpmPath = undefined,
	    mockTemp = undefined,
	    mockAWS = undefined,
	    mockS3 = undefined,
	    s3ConstructorSpy = undefined;

	beforeEach(function (done) {
		_temp2["default"].mkdir("akiroPackager", function (error, newTemporaryDirectoryPath) {
			temporaryDirectoryPath = newTemporaryDirectoryPath;
			done();
		});
	});

	// afterEach(done => {
	// 	temp.cleanup(done);
	// });

	beforeEach(function (done) {
		this.timeout(60000);

		event = {
			region: "us-east-1",
			packages: {
				"async": _packageJson2["default"].dependencies.async
			}
		};

		mockExec = _sinon2["default"].spy(function (command, callback) {
			var nodeCliPath = temporaryDirectoryPath + "/node_modules/npm/bin/npm-cli.js";
			switch (command) {
				case "cd " + temporaryDirectoryPath + ";node " + nodeCliPath + " init -y":
					var newPackageJson = require(__dirname + "/../../fixtures/newPackage.json");
					_fsExtra2["default"].writeFile(temporaryDirectoryPath + "/package.json", JSON.stringify(newPackageJson), function (error) {
						callback(error);
					});
					break;
				case "cd " + temporaryDirectoryPath + ";node " + nodeCliPath + " install":
					_fsExtra2["default"].copy(nodeModulesDirectoryPath + "/async", temporaryDirectoryPath + "/node_modules/async", function (error) {
						callback(error);
					});
					break;
				default:
					callback(new Error("exec called with '" + command + "', but it is not mocked."));
			}
		});

		nodeModulesDirectoryPath = __dirname + "/../../../../node_modules";

		mockNpmPath = nodeModulesDirectoryPath + "/npm";

		mockTemp = {
			mkdir: _sinon2["default"].spy(function (directoryName, callback) {
				callback(null, temporaryDirectoryPath);
			})
		};

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

		context = {
			AWS: mockAWS,
			exec: mockExec,
			npmPath: mockNpmPath,
			temp: mockTemp,
			succeed: function succeed(succeedResults) {
				results = succeedResults;
				done();
			},
			fail: function fail(error) {
				done(error);
			}
		};

		akiroPackager = new _libAkiroPackagersNodejsAkiroPackagerJs2["default"](event, context);
		akiroPackager.invoke(event, context);
	});

	describe("akiroPackager.temp", function () {
		it("should be set to context.temp if provided", function () {
			akiroPackager.temp.should.eql(mockTemp);
		});

		it("should be set to the temp package if not provided", function () {
			context = {};
			akiroPackager = new _libAkiroPackagersNodejsAkiroPackagerJs2["default"](event, context);
			akiroPackager.temp.should.eql(_temp2["default"]);
		});
	});

	describe("akiroPackager.npmPath", function () {
		it("should be set to context.npmPath if provided", function () {
			akiroPackager.npmPath.should.eql(mockNpmPath);
		});

		it("should be set to the npmPath package if not provided", function () {
			context = {};
			akiroPackager = new _libAkiroPackagersNodejsAkiroPackagerJs2["default"](event, context);
			akiroPackager.npmPath.should.eql("./node_modules/npm");
		});
	});

	describe("akiroPackager.exec", function () {
		it("should be set to context.exec if provided", function () {
			akiroPackager.exec.should.eql(mockExec);
		});

		it("should be set to the exec package if not provided", function () {
			context = {};
			akiroPackager = new _libAkiroPackagersNodejsAkiroPackagerJs2["default"](event, context);
			akiroPackager.exec.should.eql(_child_process.exec);
		});
	});

	describe("akiroPackager.AWS", function () {
		it("should be set to context.AWS if provided", function () {
			akiroPackager.AWS.should.eql(mockAWS);
		});

		it("should be set to the AWS package if not provided", function () {
			context = {};
			akiroPackager = new _libAkiroPackagersNodejsAkiroPackagerJs2["default"](event, context);
			akiroPackager.AWS.should.eql(_awsSdk2["default"]);
		});
	});

	describe("(Temporary Directory)", function () {
		it("should create a temporary 'akiroPackager' directory", function () {
			mockTemp.mkdir.firstCall.args[0].should.eql("akiroPackager");
		});

		it("should return any errors from creating the temporary directory", function () {
			var expectedError = new Error();

			context = {
				temp: mockTemp,
				fail: function fail(failError) {
					failError.should.eql(expectedError);
				}
			};

			mockTemp.mkdir = _sinon2["default"].spy(function (directoryName, callback) {
				callback(expectedError);
			});

			akiroPackager = new _libAkiroPackagersNodejsAkiroPackagerJs2["default"](event, context);
			akiroPackager.invoke(event, context);
		});
	});

	it("should copy ./node_modules/npm to the temporary directory", function () {
		var npmFileNames = _fsExtra2["default"].readdirSync(temporaryDirectoryPath + "/node_modules/npm");
		var expectedNpmFileNames = _fsExtra2["default"].readdirSync(nodeModulesDirectoryPath + "/npm");

		npmFileNames.should.have.members(expectedNpmFileNames);
	});

	it("should create an empty package.json to satisfy npm", function () {
		_fsExtra2["default"].existsSync(temporaryDirectoryPath + "/package.json").should.be["true"];
	});

	it("should add the designated packages as dependencies in the new package.json", function () {
		var newPackageJson = require(temporaryDirectoryPath + "/package.json");
		newPackageJson.dependencies.should.eql(event.packages);
	});

	it("should use npm to install and build all designated packages", function () {
		var asyncFileNames = _fsExtra2["default"].readdirSync(temporaryDirectoryPath + "/node_modules/async");
		var expectedAsyncFileNames = _fsExtra2["default"].readdirSync(nodeModulesDirectoryPath + "/async");

		asyncFileNames.should.have.members(expectedAsyncFileNames);
	});

	it("should add all designated package code to a .zip file", function (done) {
		/* eslint-disable new-cap */
		this.timeout(60000);

		var zipFilePath = temporaryDirectoryPath + "/packages.zip";

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

	xit("should instantiate S3 with the designated region", function () {
		s3ConstructorSpy.calledWith({
			region: event.region
		});
	});

	xit("should copy the .zip file to the designated S3 options", function () {
		var putObjectParameters = {
			Bucket: "",
			Key: "",
			Body: ""
		};
		mockS3.putObject.calledWith().should.be["true"];
	});
});