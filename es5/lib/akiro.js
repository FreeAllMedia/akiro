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

var _temp = require("temp");

var _temp2 = _interopRequireDefault(_temp);

var _akiroBuildersNodejsAkiroBuilderJs = require("./akiro/builders/nodejs/akiroBuilder.js");

var _akiroBuildersNodejsAkiroBuilderJs2 = _interopRequireDefault(_akiroBuildersNodejsAkiroBuilderJs);

var _flowsync = require("flowsync");

var _flowsync2 = _interopRequireDefault(_flowsync);

var _child_process = require("child_process");

var _awsSdk = require("aws-sdk");

var _awsSdk2 = _interopRequireDefault(_awsSdk);

var _fsExtra = require("fs-extra");

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _unzip2 = require("unzip2");

var _unzip22 = _interopRequireDefault(_unzip2);

var Akiro = (function () {
	function Akiro() {
		var config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

		_classCallCheck(this, Akiro);

		var _ = (0, _incognito2["default"])(this);

		_.config = config;
		_.config.region = _.config.region || "us-east-1";

		this.conan = _.config.conan || new _conan2["default"]({ region: _.config.region });
		this.conan.use(_conan.ConanAwsLambdaPlugin);

		this.Async = _.config.Async || _flowsync2["default"];
		this.AWS = _.config.AWS || _awsSdk2["default"];
		this.temp = _.config.temp || _temp2["default"];
		this.exec = _.config.exec || _child_process.exec;
		this.cacheDirectoryPath = _.config.cacheDirectoryPath || "./.akiro/cache";

		//this.temp.track();
	}

	_createClass(Akiro, [{
		key: "initialize",
		value: function initialize(iamRoleName, callback) {
			var _this = this;

			var conan = this.conan;

			var lambdaName = "AkiroBuilder";
			var lambdaRole = iamRoleName;
			var lambdaFilePath = __dirname + "/akiro/builders/nodejs/akiroBuilder.js";
			var handlerFilePath = __dirname + "/akiro/builders/nodejs/handler.js";

			var lambda = conan.lambda(lambdaName, handlerFilePath, lambdaRole);
			lambda.dependencies(lambdaFilePath);

			var createBuilderTask = function createBuilderTask(dependencyName, dependencyVersionRange, temporaryDirectoryPath) {
				return function (done) {
					var mockTemp = {
						mkdir: function mkdir(directoryName, mkdirCallback) {
							mkdirCallback(null, temporaryDirectoryPath);
						}
					};

					var event = {
						"package": {
							name: dependencyName,
							version: dependencyVersionRange
						}
					};

					var npmPath = _path2["default"].normalize(__dirname + "/../../node_modules/npm/bin/npm-cli.js");

					var context = {
						exec: _this.exec,
						npmPath: npmPath,
						temp: mockTemp,
						succeed: function succeed() {
							done();
						}
					};
					var builder = new _akiroBuildersNodejsAkiroBuilderJs2["default"](event, context);
					builder.invoke(event, context);
				};
			};

			this.temp.mkdir("akiro.initialize", function (error, temporaryDirectoryPath) {
				_this.Async.series([function (done) {
					var builderDependencyTasks = [];

					for (var dependencyName in _packageJson.builderDependencies) {
						var dependencyVersionRange = _packageJson.builderDependencies[dependencyName];
						builderDependencyTasks.push(createBuilderTask(dependencyName, dependencyVersionRange, temporaryDirectoryPath));
					}

					_this.Async.series(builderDependencyTasks, done);
				}], function () {
					lambda.dependencies(temporaryDirectoryPath + "/node_modules/**/*");
					conan.deploy(callback);
				});
			});
		}
	}, {
		key: "package",
		value: function _package(packageDetails, outputDirectoryPath, callback) {
			var _this2 = this;

			var lambda = new this.AWS.Lambda({ region: this.config.region });
			var s3 = new this.AWS.S3({ region: this.config.region });

			var invokeLambdaTasks = [];

			for (var packageName in packageDetails) {
				var packageVersionRange = packageDetails[packageName];
				invokeLambdaTasks.push(createInvokeLambdaTask(packageName, packageVersionRange, this));
			}

			function createInvokeLambdaTask(packageName, packageVersionRange, context) {
				return function (done) {
					lambda.invoke({
						FunctionName: "AkiroBuilder", /* required */
						Payload: JSON.stringify({
							bucket: context.config.bucket,
							region: context.config.region,
							"package": {
								name: packageName,
								version: packageVersionRange
							}
						})
					}, done);
				};
			}

			this.Async.parallel(invokeLambdaTasks, function (error, data) {

				function createGetObjectTask(fileName, context) {
					return function (done) {
						var objectReadStream = s3.getObject({
							Bucket: context.config.bucket,
							Key: fileName
						}).createReadStream();

						var objectLocalFileName = context.cacheDirectoryPath + "/" + fileName;
						var objectWriteStream = _fsExtra2["default"].createWriteStream(objectLocalFileName);

						objectWriteStream.on("close", function () {
							/* eslint-disable new-cap */

							var writeFileTasks = [];

							function createWriteFileTask(outputFileName, entry) {
								return function (writeTaskDone) {
									var fileWriteStream = _fsExtra2["default"].createWriteStream(outputFileName);
									fileWriteStream.on("close", writeTaskDone);

									entry.pipe(fileWriteStream);
								};
							}

							console.log("HAAWWWHHHHHAAAAAAA?!!?!?!", objectLocalFileName);

							_fsExtra2["default"].createReadStream(objectLocalFileName).pipe(_unzip22["default"].Parse()).on("entry", function (entry) {
								var outputFileName = outputDirectoryPath + "/" + entry.path;
								writeFileTasks.push(createWriteFileTask(outputFileName, entry));
							}).on("close", function () {
								_flowsync2["default"].parallel(writeFileTasks, done);
							});
						});

						objectReadStream.pipe(objectWriteStream);
					};
				}

				if (!error) {
					(function () {
						var getObjectTasks = [];

						data.forEach(function (returnData) {
							var fileName = returnData.fileName;
							getObjectTasks.push(createGetObjectTask(fileName, _this2));
						});

						_this2.Async.parallel(getObjectTasks, callback);
					})();
				} else {
					callback(error);
				}
			});
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