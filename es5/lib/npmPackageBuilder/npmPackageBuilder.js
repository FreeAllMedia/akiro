"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _mrt = require("mrt");

var _mrt2 = _interopRequireDefault(_mrt);

var _child_process = require("child_process");

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _flowsync = require("flowsync");

var _flowsync2 = _interopRequireDefault(_flowsync);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var initPackageJson = Symbol();
var createOutputDirectory = Symbol();
var buildPackages = Symbol();
var addDependenciesToPackageJson = Symbol();
var externalFunction = Symbol();
var movePackages = Symbol();

var NpmPackageBuilder = function (_ChainLink) {
	_inherits(NpmPackageBuilder, _ChainLink);

	function NpmPackageBuilder() {
		_classCallCheck(this, NpmPackageBuilder);

		return _possibleConstructorReturn(this, Object.getPrototypeOf(NpmPackageBuilder).apply(this, arguments));
	}

	_createClass(NpmPackageBuilder, [{
		key: "initialize",
		value: function initialize(packageList, outputDirectoryPath) {
			var configuration = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

			this.parameters("packageList", "outputDirectoryPath", "basePath", "npmPath");

			var libraries = configuration.libraries || {};
			var npmPath = configuration.npmPath || _path2.default.normalize(__dirname + "/../../../node_modules/npm/bin/npm-cli.js");

			this.libraries = {
				exec: libraries.exec || _child_process.exec
			};

			this.packageList(packageList);
			this.outputDirectoryPath(outputDirectoryPath);
			this.basePath(configuration.basePath);
			this.npmPath(npmPath);
		}
	}, {
		key: "build",
		value: function build(callback) {
			_flowsync2.default.series([this[createOutputDirectory].bind(this), this[initPackageJson].bind(this), this[addDependenciesToPackageJson].bind(this), this[buildPackages].bind(this), this[movePackages].bind(this)], callback);
		}
	}, {
		key: createOutputDirectory,
		value: function value(done) {
			_fs2.default.mkdir(this.outputDirectoryPath(), function () {
				done();
			});
		}
	}, {
		key: initPackageJson,
		value: function value(done) {
			var commands = ["cd " + this.outputDirectoryPath(), "node " + this.npmPath() + " init -y"];

			this.libraries.exec(commands.join(";"), done);
		}
	}, {
		key: addDependenciesToPackageJson,
		value: function value(done) {
			this[externalFunction]("./npmPackageBuilder.addDependenciesToPackageJson.js", done);
		}
	}, {
		key: buildPackages,
		value: function value(done) {
			this[externalFunction]("./npmPackageBuilder.buildPackages.js", done);
		}
	}, {
		key: movePackages,
		value: function value(done) {
			this[externalFunction]("./npmPackageBuilder.movePackages.js", done);
		}
	}, {
		key: externalFunction,
		value: function value(functionFilePath) {
			var _require$default;

			for (var _len = arguments.length, parameters = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
				parameters[_key - 1] = arguments[_key];
			}

			return (_require$default = require(functionFilePath).default).call.apply(_require$default, [this].concat(parameters));
		}
	}]);

	return NpmPackageBuilder;
}(_mrt2.default);

exports.default = NpmPackageBuilder;