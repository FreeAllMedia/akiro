"use strict";

var _akiro = require("../../lib/akiro.js");

var _akiro2 = _interopRequireDefault(_akiro);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe("Akiro(config)", function () {
	var akiro = undefined,
	    config = undefined;

	beforeEach(function () {
		config = {
			debug: true
		};
		akiro = new _akiro2.default(config);
	});

	it("should accept a debug config option for .package()", function (done) {
		akiro.package({}, "", done);
	});
});