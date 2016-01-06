"use strict";

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _libAkiroJs = require("../lib/akiro.js");

var _libAkiroJs2 = _interopRequireDefault(_libAkiroJs);

describe("Akiro(config)", function () {
	var akiro = undefined,
	    config = undefined;

	before(function () {
		config = {
			branch: "someBranch"
		};
		akiro = new _libAkiroJs2["default"](config);
	});

	describe(".config", function () {
		it("should return the config object provided to the constructor", function () {
			akiro.config.should.eql(config);
		});

		it("should be read-only", function () {
			(function () {
				akiro.config = 123;
			}).should["throw"]();
		});
	});
});