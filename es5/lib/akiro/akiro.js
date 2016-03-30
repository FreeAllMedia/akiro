"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.AkiroPackage = exports.AkiroPackages = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _mrt = require("mrt");

var _mrt2 = _interopRequireDefault(_mrt);

var _conan = require("conan");

var _conan2 = _interopRequireDefault(_conan);

var _conanAwsLambda = require("conan-aws-lambda");

var _conanAwsLambda2 = _interopRequireDefault(_conanAwsLambda);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _temp = require("temp");

var _temp2 = _interopRequireDefault(_temp);

var _incognito = require("incognito");

var _incognito2 = _interopRequireDefault(_incognito);

var _npmPackageBuilder = require("../npmPackageBuilder/npmPackageBuilder.js");

var _npmPackageBuilder2 = _interopRequireDefault(_npmPackageBuilder);

var _akiroPackages = require("../akiroPackages/akiroPackages.js");

var _akiroPackages2 = _interopRequireDefault(_akiroPackages);

var _akiroPackage = require("../akiroPackage/akiroPackage.js");

var _akiroPackage2 = _interopRequireDefault(_akiroPackage);

var _package = require("../../../package.json");

var _package2 = _interopRequireDefault(_package);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var setParameters = Symbol();
var setLinks = Symbol();
var setDefaults = Symbol();
var setPrivateData = Symbol();
var setNpmPackageBuilder = Symbol();
var setConan = Symbol();
var setLambda = Symbol();

var Akiro = function (_ChainLink) {
	_inherits(Akiro, _ChainLink);

	function Akiro() {
		_classCallCheck(this, Akiro);

		return _possibleConstructorReturn(this, Object.getPrototypeOf(Akiro).apply(this, arguments));
	}

	_createClass(Akiro, [{
		key: "initialize",
		value: function initialize() {
			var config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			this[setParameters]();
			this[setLinks]();
			this[setDefaults](config);
			this[setPrivateData](config);
			this[setConan]();
			this[setLambda]();
			this[setNpmPackageBuilder]();
		}
	}, {
		key: "install",
		value: function install(callback) {
			return require("../akiro/akiro.install.js").default.call(this, callback);
		}
	}, {
		key: setParameters,
		value: function value() {
			this.parameters("role", "region", "bucket", "temporaryDirectoryPath", "builderDependencies");
		}
	}, {
		key: setLinks,
		value: function value() {
			this.link("packages", _akiroPackages2.default);
		}
	}, {
		key: setDefaults,
		value: function value(config) {
			this.role(config.role);
			this.region(config.region);
			this.bucket(config.bucket);

			this.builderDependencies(config.builderDependencies || _package2.default.builderDependencies);

			config.libraries = config.libraries || {};

			var temporaryDirectoryPath = config.temporaryDirectoryPath || _temp2.default.mkdirSync();
			this.temporaryDirectoryPath(temporaryDirectoryPath);
		}
	}, {
		key: setPrivateData,
		value: function value(config) {
			var _ = (0, _incognito2.default)(this);
			_.Conan = config.libraries.conan || _conan2.default;
			_.NpmPackageBuilder = config.libraries.npmPackageBuilder || _npmPackageBuilder2.default;
		}
	}, {
		key: setNpmPackageBuilder,
		value: function value() {
			var _ = (0, _incognito2.default)(this);
			this.npmPackageBuilder = new _.NpmPackageBuilder();
		}
	}, {
		key: setConan,
		value: function value() {
			var _ = (0, _incognito2.default)(this);

			this.conan = new _.Conan();
			this.conan.use(_conanAwsLambda2.default);
		}
	}, {
		key: setLambda,
		value: function value() {
			var handlerFilePath = _path2.default.normalize(__dirname + "/../akiroBuilder/npm/handler.js");

			this.lambda = this.conan.lambda("AkiroBuilder");

			this.lambda.dependencies("**/*", {
				basePath: this.temporaryDirectoryPath()
			}).timeout(300).filePath(handlerFilePath).role(this.role());
		}
	}]);

	return Akiro;
}(_mrt2.default);

exports.default = Akiro;
exports.AkiroPackages = _akiroPackages2.default;
exports.AkiroPackage = _akiroPackage2.default;