"use strict";

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _libAkiroJs = require("../lib/akiro.js");

var _libAkiroJs2 = _interopRequireDefault(_libAkiroJs);

var _conan = require("conan");

var _conan2 = _interopRequireDefault(_conan);

var _temp = require("temp");

var _temp2 = _interopRequireDefault(_temp);

var _child_process = require("child_process");

describe("Akiro(config)", function () {
	var akiro = undefined,
	    config = undefined,
	    conan = undefined;

	beforeEach(function () {
		config = {};

		akiro = new _libAkiroJs2["default"](config);
	});

	it("should not require a config object", function () {
		(function () {
			akiro = new _libAkiroJs2["default"]();
		}).should.not["throw"]();
	});

	describe("akiro.conan", function () {
		describe("(When akiro.config.conan is set)", function () {
			it("should set akiro.conan to akiro.config.conan", function () {
				conan = new _conan2["default"]();
				config = {
					conan: conan
				};
				akiro = new _libAkiroJs2["default"](config);
				akiro.conan.should.eql(conan);
			});
		});
		describe("(When akiro.config.conan is NOT set)", function () {
			it("should set akiro.conan to a new instance of Conan", function () {
				akiro.conan.should.be.instanceOf(_conan2["default"]);
			});
		});
	});

	describe("akiro.config", function () {
		it("should return the supplied config object", function () {
			akiro.config.should.eql(config);
		});

		it("should be read-only", function () {
			(function () {
				akiro.config = { "new": "config" };
			}).should["throw"]();
		});
	});

	describe("akiro.config.region", function () {
		it("should default to 'us-east-1'", function () {
			akiro.config.region.should.eql("us-east-1");
		});
		it("should be used by Conan", function () {
			akiro.conan.config.region.should.eql("us-east-1");
		});
	});

	describe("akiro.temp", function () {
		describe("(When akiro.config.temp is set)", function () {
			it("should set akiro.temp to akiro.config.temp", function () {
				var mockTemp = {
					track: function track() {}
				};
				config = {
					temp: mockTemp
				};
				akiro = new _libAkiroJs2["default"](config);
				akiro.temp.should.eql(mockTemp);
			});
		});
		describe("(When akiro.config.temp is NOT set)", function () {
			it("should set akiro.temp to the temp package", function () {
				akiro.temp.should.eql(_temp2["default"]);
			});
		});
	});

	describe("akiro.exec", function () {
		describe("(When akiro.config.exec is set)", function () {
			it("should set akiro.exec to akiro.config.exec", function () {
				var mockExec = {};
				config = {
					exec: mockExec
				};
				akiro = new _libAkiroJs2["default"](config);
				akiro.exec.should.eql(mockExec);
			});
		});
		describe("(When akiro.config.exec is NOT set)", function () {
			it("should set akiro.exec to the exec package", function () {
				akiro.exec.should.eql(_child_process.exec);
			});
		});
	});
});