"use strict";

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _libAkiroPackagersNodejsAkiroPackagerJs = require("../../../../lib/akiro/packagers/nodejs/akiroPackager.js");

var _libAkiroPackagersNodejsAkiroPackagerJs2 = _interopRequireDefault(_libAkiroPackagersNodejsAkiroPackagerJs);

var _sinon = require("sinon");

var _sinon2 = _interopRequireDefault(_sinon);

var _temp = require("temp");

var _temp2 = _interopRequireDefault(_temp);

var _packageJson = require("../../../../../package.json");

var _packageJson2 = _interopRequireDefault(_packageJson);

var _helpersMockExecJs = require("../../../helpers/mockExec.js");

var _helpersMockExecJs2 = _interopRequireDefault(_helpersMockExecJs);

var _helpersMockTempJs = require("../../../helpers/mockTemp.js");

var _helpersMockTempJs2 = _interopRequireDefault(_helpersMockTempJs);

_temp2["default"].track();

describe("AkiroPackager(event, context)", function () {
	var event = undefined,
	    context = undefined,
	    akiroPackager = undefined,
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

	afterEach(function (done) {
		_temp2["default"].cleanup(done);
	});

	beforeEach(function (done) {
		this.timeout(60000);

		event = {
			region: "us-east-1",
			"package": {
				name: "async",
				version: _packageJson2["default"].dependencies.async
			}
		};

		nodeModulesDirectoryPath = __dirname + "/../../../../../node_modules";

		mockExec = (0, _helpersMockExecJs2["default"])(temporaryDirectoryPath, nodeModulesDirectoryPath);
		mockNpmPath = nodeModulesDirectoryPath + "/npm";
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
			AWS: mockAWS,
			exec: mockExec,
			npmPath: mockNpmPath,
			temp: mockTemp,
			succeed: done,
			fail: done
		};

		akiroPackager = new _libAkiroPackagersNodejsAkiroPackagerJs2["default"](event, context);
		akiroPackager.invoke(event, context);
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
});