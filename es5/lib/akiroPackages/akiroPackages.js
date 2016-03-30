"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _mrt = require("mrt");

var _mrt2 = _interopRequireDefault(_mrt);

var _akiroPackage = require("../akiroPackage/akiroPackage.js");

var _akiroPackage2 = _interopRequireDefault(_akiroPackage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var setupPackages = Symbol();

var AkiroPackages = function (_ChainLink) {
	_inherits(AkiroPackages, _ChainLink);

	function AkiroPackages() {
		_classCallCheck(this, AkiroPackages);

		return _possibleConstructorReturn(this, Object.getPrototypeOf(AkiroPackages).apply(this, arguments));
	}

	_createClass(AkiroPackages, [{
		key: "initialize",
		value: function initialize(requestedPackages) {
			this.parameters("requestedPackages");
			this.requestedPackages(requestedPackages);

			this.link("newPackage", _akiroPackage2.default).into("packageList").usingKey("name");

			this[setupPackages](requestedPackages);
		}
	}, {
		key: setupPackages,
		value: function value(requestedPackages) {
			for (var packageName in requestedPackages) {
				var packageVersion = requestedPackages[packageName];

				this.newPackage(packageName, packageVersion);
			}
		}
	}, {
		key: "package",
		value: function _package(packageName) {
			return this.packageList[packageName];
		}
	}]);

	return AkiroPackages;
}(_mrt2.default);

exports.default = AkiroPackages;