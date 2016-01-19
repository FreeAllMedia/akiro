"use strict";

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _libAkiroJs = require("../../lib/akiro.js");

var _libAkiroJs2 = _interopRequireDefault(_libAkiroJs);

var _conan = require("conan");

var _helpersMockConanJs = require("../helpers/mockConan.js");

var _helpersMockConanJs2 = _interopRequireDefault(_helpersMockConanJs);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _packageJson = require("../../../package.json");

var _temp = require("temp");

var _temp2 = _interopRequireDefault(_temp);

var _sinon = require("sinon");

var _sinon2 = _interopRequireDefault(_sinon);

var _fsExtra = require("fs-extra");

var _fsExtra2 = _interopRequireDefault(_fsExtra);

_temp2["default"].track();

describe("akiro.initialize(iamRoleName, callback)", function () {
	var config = undefined,
	    akiro = undefined,
	    callback = undefined,
	    lambdaName = undefined,
	    lambdaRole = undefined,
	    lambdaFilePath = undefined,
	    handlerFilePath = undefined,
	    temporaryDirectoryPath = undefined,
	    mockConan = undefined,
	    mockConanLambda = undefined,
	    mockTemp = undefined;

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
		lambdaName = "akiroBuilder";
		lambdaRole = "AkiroLambda";
		lambdaFilePath = _path2["default"].normalize(__dirname + "../../../lib/akiro/builders/nodejs/akiroBuilder.js");
		handlerFilePath = _path2["default"].normalize(__dirname + "../../../lib/akiro/builders/nodejs/handler.js");

		mockTemp = {
			mkdir: _sinon2["default"].spy(function (directoryName, mkdirCallback) {
				mkdirCallback(null, temporaryDirectoryPath);
			}),
			track: function track() {}
		};

		config = {
			conan: mockConan = new _helpersMockConanJs2["default"](),
			temp: mockTemp
		};

		akiro = new _libAkiroJs2["default"](config);

		callback = done;
		akiro.initialize(lambdaRole, callback);
	});

	it("should use the ConanAwsLambdaPlugin", function () {
		mockConan.use.calledWith(_conan.ConanAwsLambdaPlugin).should.be["true"];
	});

	xdescribe("Akiro Lambda", function () {
		beforeEach(function () {
			mockConanLambda = mockConan.components.lambda;
		});

		it("should use the correct name", function () {
			mockConanLambda.name.calledWith(lambdaName).should.be["true"];
		});

		it("should use the 'nodejs' runtime", function () {
			mockConanLambda.runtime.firstCall.args[0].should.eql("nodejs");
		});

		it("should use the supplied handlerFilePath", function () {
			mockConanLambda.filePath.firstCall.args[0].should.eql(handlerFilePath);
		});

		it("should use the supplied role", function () {
			mockConanLambda.role.firstCall.args[0].should.eql(lambdaRole);
		});

		it("should use AkiroBuilder to build its own dependencies in a temp directory", function () {
			var dependencyFileNames = _fsExtra2["default"].readdirSync(temporaryDirectoryPath);

			dependencyFileNames.should.eql([1, 2, 3]);
		});

		xit("should include akiroBuilder and dependencies", function () {
			var dependencyPaths = [lambdaFilePath];

			for (var dependencyName in _packageJson.builderDependencies) {
				var dependencyPath = _path2["default"].normalize(__dirname + "../../../../node_modules");
				dependencyPaths.push(dependencyPath + "/" + dependencyName + "/**/{*.*,.*}");
			}

			mockConanLambda.dependencies().should.eql(dependencyPaths);
		});

		it("should be deployed to AWS", function () {
			mockConan.deploy.calledWith(callback).should.be["true"];
		});
	});
});