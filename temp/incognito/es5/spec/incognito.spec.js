"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _ = require("../../");

var _2 = _interopRequireDefault(_);

var Cup = (function () {
	function Cup() {
		_classCallCheck(this, Cup);

		(0, _2["default"])(this).content = "wine";
	}

	_createClass(Cup, [{
		key: "getContent",
		value: function getContent() {
			return (0, _2["default"])(this).content;
		}
	}, {
		key: "clean",
		value: function clean() {
			(0, _2["default"])(this).content = null;
		}
	}]);

	return Cup;
})();

var Glass = (function () {
	function Glass() {
		_classCallCheck(this, Glass);

		(0, _2["default"])(this).content = "water";
	}

	_createClass(Glass, [{
		key: "getContent",
		value: function getContent() {
			return (0, _2["default"])(this).content;
		}
	}]);

	return Glass;
})();

describe("Incognito", function () {
	var cup = undefined,
	    glass = undefined;

	before(function () {
		cup = new Cup();
		glass = new Glass();
	});

	it("should provide a private context for a Cup example class that has private content", function () {
		cup.getContent().should.equal("wine");
	});

	it("should not interfer other classes", function () {
		glass.getContent().should.equal("water");
	});

	it("should not interfer other instances of the same class", function () {
		var secondCup = new Cup();
		cup.clean();
		secondCup.getContent().should.equal("wine");
	});
});