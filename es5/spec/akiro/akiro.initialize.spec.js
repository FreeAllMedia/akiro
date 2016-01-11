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

describe("akiro.initialize(iamRoleName, callback)", function () {
	var config = undefined,
	    akiro = undefined,
	    callback = undefined,
	    lambdaName = undefined,
	    lambdaRole = undefined,
	    lambdaFilePath = undefined,
	    mockConan = undefined,
	    mockConanLambda = undefined;

	beforeEach(function (done) {
		lambdaName = "Akiro";
		lambdaRole = "AkiroLambda";
		lambdaFilePath = _path2["default"].normalize(__dirname + "../../../lib/akiro/packagers/akiro.packager.nodejs.js");

		config = {
			conan: mockConan = new _helpersMockConanJs2["default"]()
		};

		akiro = new _libAkiroJs2["default"](config);

		callback = done;
		akiro.initialize(lambdaRole, callback);
	});

	it("should use the ConanAwsLambdaPlugin", function () {
		mockConan.use.calledWith(_conan.ConanAwsLambdaPlugin).should.be["true"];
	});

	describe("Akiro Lambda", function () {
		beforeEach(function () {
			mockConanLambda = mockConan.components.lambda;
		});

		it("should use the correct name", function () {
			mockConanLambda.name.calledWith(lambdaName).should.be["true"];
		});

		it("should use the 'nodejs' runtime", function () {
			mockConanLambda.runtime.firstCall.args[0].should.eql("nodejs");
		});

		it("should use the supplied lambdaFilePath", function () {
			mockConanLambda.filePath.firstCall.args[0].should.eql(lambdaFilePath);
		});

		it("should use the supplied role", function () {
			mockConanLambda.role.firstCall.args[0].should.eql(lambdaRole);
		});

		it("should include all dependencies", function () {
			var dependencyPaths = [];

			for (var dependencyName in _packageJson.dependencies) {
				var dependencyPath = _path2["default"].normalize(__dirname + "../../../../node_modules");
				dependencyPaths.push(dependencyPath + "/" + dependencyName + "/**/{*.*,.*}");
			}

			mockConanLambda.dependencies.firstCall.args[0].should.eql(dependencyPaths);
		});

		it("should be deployed to AWS", function () {
			mockConan.deploy.calledWith(callback).should.be["true"];
		});
	});
});