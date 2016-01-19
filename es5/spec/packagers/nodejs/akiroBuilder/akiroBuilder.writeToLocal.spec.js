"use strict";

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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

xdescribe("AkiroBuilder(event, context)", function () {
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
			bucket: "akiro.test",
			"package": {
				name: "async",
				version: "1.0.0"
			}
		};

		nodeModulesDirectoryPath = __dirname + "/../../../../../node_modules";

		mockNpmPath = nodeModulesDirectoryPath + "/npm/bin/npm-cli.js";
		mockExec = (0, _helpersMockExecJs2["default"])(temporaryDirectoryPath, nodeModulesDirectoryPath, mockNpmPath);
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

		context = {
			localFilePath: temporaryDirectoryPath + "/local.zip",
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

	describe("(With context.localFilePath set)", function () {
		it("should copy the .zip file to the designated local file path", function () {
			_fsExtra2["default"].existsSync(context.localFilePath).should.be["true"];
		});
		it("should copy the .zip file to the designated local file path", function () {
			var expectedFileData = _fsExtra2["default"].readFileSync(__dirname + "/../../../fixtures/async-1.0.0.zip");
			var fileData = _fsExtra2["default"].readFileSync(context.localFilePath);
			fileData.should.eql(expectedFileData);
		});
	});

	describe("(WITHOUT context.localFilePath set)", function () {
		beforeEach(function (done) {
			context.localFilePath = undefined;

			context.succeed = done;

			akiroBuilder = new _libAkiroBuildersNodejsAkiroBuilderJs2["default"](event, context);
			akiroBuilder.invoke(event, context);
		});

		it("should copy the .zip file to the designated local file path", function () {
			var zipFileName = event["package"].name + "-" + _node_modulesAsyncPackageJson2["default"].version + ".zip";
			var zipFileData = _fsExtra2["default"].readFileSync(__dirname + "/../../../fixtures/async-1.0.0.zip");
			var putObjectParameters = {
				Bucket: event.bucket,
				Key: zipFileName,
				Body: zipFileData
			};
			mockS3.putObject.calledWith(putObjectParameters);
		});
	});
});