"use strict";

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _libAkiroJs = require("../../lib/akiro.js");

var _libAkiroJs2 = _interopRequireDefault(_libAkiroJs);

var _sinon = require("sinon");

var _sinon2 = _interopRequireDefault(_sinon);

var _helpersMockAwsJs = require("../helpers/mockAws.js");

var _helpersMockAwsJs2 = _interopRequireDefault(_helpersMockAwsJs);

describe("akiro.deploy(callback)", function () {
	var config = undefined,
	    akiro = undefined,
	    callback = undefined,
	    roleName = undefined;

	beforeEach(function (done) {
		_helpersMockAwsJs2["default"].reset();

		roleName = "SomeRole";

		config = {
			AWS: _helpersMockAwsJs2["default"],
			role: roleName
		};

		akiro = new _libAkiroJs2["default"](config);

		akiro.deploy(done);
	});

	it("should create an Akiro Builder lambda function on AWS");
});