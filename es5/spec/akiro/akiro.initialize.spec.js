"use strict";

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _libAkiroJs = require("../../lib/akiro.js");

var _libAkiroJs2 = _interopRequireDefault(_libAkiroJs);

var _helpersMockAwsJs = require("../helpers/mockAws.js");

var _helpersMockAwsJs2 = _interopRequireDefault(_helpersMockAwsJs);

describe("akiro.initialize(callback)", function () {
	var config = undefined,
	    akiro = undefined,
	    callback = undefined,
	    roleName = undefined;

	beforeEach(function (done) {
		_helpersMockAwsJs2["default"].reset();

		config = {
			AWS: _helpersMockAwsJs2["default"]
		};

		akiro = new _libAkiroJs2["default"](config);

		akiro.initialize(done);
	});

	it("should create an Akiro Builder lambda function on AWS");
});