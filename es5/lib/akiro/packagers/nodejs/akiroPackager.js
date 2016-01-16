"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _temp = require("temp");

var _temp2 = _interopRequireDefault(_temp);

var _flowsync = require("flowsync");

var _flowsync2 = _interopRequireDefault(_flowsync);

var _fsExtra = require("fs-extra");

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _child_process = require("child_process");

var _archiver = require("archiver");

var _archiver2 = _interopRequireDefault(_archiver);

var _glob = require("glob");

var _glob2 = _interopRequireDefault(_glob);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _awsSdk = require("aws-sdk");

var _awsSdk2 = _interopRequireDefault(_awsSdk);

var AkiroPackager = (function () {
	function AkiroPackager(event, context) {
		_classCallCheck(this, AkiroPackager);

		this.AWS = context.AWS || _awsSdk2["default"];
		this.exec = context.exec || _child_process.exec;
		this.temp = context.temp || _temp2["default"];
		this.npmPath = context.npmPath || "./node_modules/npm";
	}

	_createClass(AkiroPackager, [{
		key: "invoke",
		value: function invoke(event, context) {
			var _this = this;

			_flowsync2["default"].waterfall([function (done) {
				_this.temp.mkdir("akiroPackager", done);
			}, function (temporaryDirectoryPath, done) {
				var temporaryNpmPath = temporaryDirectoryPath + "/node_modules/npm";
				_fsExtra2["default"].copy(_this.npmPath, temporaryNpmPath, function (error) {
					done(error, temporaryDirectoryPath);
				});
			}, function (temporaryDirectoryPath, done) {
				var commands = ["cd " + temporaryDirectoryPath, "node " + temporaryDirectoryPath + "/node_modules/npm/bin/npm-cli.js init -y"];
				_this.exec(commands.join(";"), function (error) {
					done(error, temporaryDirectoryPath);
				});
			}, function (temporaryDirectoryPath, done) {
				var packageJsonFilePath = temporaryDirectoryPath + "/package.json";
				var packageJson = require(packageJsonFilePath);
				packageJson.dependencies = _defineProperty({}, event["package"].name, event["package"].version);
				_fsExtra2["default"].writeFile(packageJsonFilePath, JSON.stringify(packageJson), function (error) {
					done(error, temporaryDirectoryPath);
				});
			}, function (temporaryDirectoryPath, done) {
				var commands = ["cd " + temporaryDirectoryPath, "node " + temporaryDirectoryPath + "/node_modules/npm/bin/npm-cli.js install"];
				_this.exec(commands.join(";"), function (error) {
					done(error, temporaryDirectoryPath);
				});
			}, function (temporaryDirectoryPath, done) {
				var packagesZip = (0, _archiver2["default"])("zip", {});
				var nodeModulesGlob = temporaryDirectoryPath + "/node_modules/**/*";
				(0, _glob2["default"])(nodeModulesGlob, { dot: true }, function (error, filePaths) {
					filePaths.forEach(function (filePath) {
						var isDirectory = _fsExtra2["default"].statSync(filePath).isDirectory();
						if (!isDirectory) {
							var fileReadStream = _fsExtra2["default"].createReadStream(filePath);
							var relativeFilePath = _path2["default"].relative(temporaryDirectoryPath + "/node_modules/", filePath);
							packagesZip.append(fileReadStream, { name: relativeFilePath });
						}
					});

					var zipFileWriteStream = _fsExtra2["default"].createWriteStream(temporaryDirectoryPath + "/packages.zip");

					zipFileWriteStream.on("close", done);
					packagesZip.pipe(zipFileWriteStream);
					packagesZip.finalize();
				});
			}], function (error) {
				if (error) {
					context.fail(error);
				} else {
					context.succeed();
				}
			});
		}
	}]);

	return AkiroPackager;
})();

exports["default"] = AkiroPackager;
module.exports = exports["default"];