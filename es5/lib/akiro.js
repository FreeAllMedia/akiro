"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _incognito = require("incognito");

var _incognito2 = _interopRequireDefault(_incognito);

var _conan = require("conan");

var _conan2 = _interopRequireDefault(_conan);

var _packageJson = require("../../package.json");

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var Akiro = (function () {
	function Akiro(config) {
		_classCallCheck(this, Akiro);

		var _ = (0, _incognito2["default"])(this);

		_.config = config;
		_.conan = _.config.conan || new _conan2["default"]();
	}

	_createClass(Akiro, [{
		key: "initialize",
		value: function initialize(callback) {
			var conan = (0, _incognito2["default"])(this).conan;

			var lambdaName = "Akiro";
			var lambdaRole = "AkiroLambda";
			var lambdaFilePath = __dirname + "/akiro/packagers/akiro.packager.nodejs.js";

			var packageDependencyNames = Object.keys(_packageJson.dependencies);

			var packageDependencyPaths = [];
			packageDependencyNames.forEach(function (packageDependencyName) {
				var nodeModulesDirectoryPath = _path2["default"].normalize(__dirname + "/../node_modules");
				var packageDependencyPath = nodeModulesDirectoryPath + "/" + packageDependencyName + "/**/*";
				packageDependencyPaths.push(packageDependencyPath);
			});

			conan.lambda(lambdaName, lambdaFilePath, lambdaRole).dependencies(packageDependencyPaths);

			conan.deploy(callback);
		}
	}, {
		key: "config",
		get: function get() {
			return (0, _incognito2["default"])(this).config;
		}
	}]);

	return Akiro;
})();

exports["default"] = Akiro;
module.exports = exports["default"];