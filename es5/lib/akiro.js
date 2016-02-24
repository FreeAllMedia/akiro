"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _incognito = require("incognito");

var _incognito2 = _interopRequireDefault(_incognito);

var _conan = require("conan");

var _conan2 = _interopRequireDefault(_conan);

var _conanAwsLambda = require("conan-aws-lambda");

var _conanAwsLambda2 = _interopRequireDefault(_conanAwsLambda);

var _package2 = require("../../package.json");

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _temp = require("temp");

var _temp2 = _interopRequireDefault(_temp);

var _akiroBuilder = require("./akiro/builders/nodejs/akiroBuilder.js");

var _akiroBuilder2 = _interopRequireDefault(_akiroBuilder);

var _flowsync = require("flowsync");

var _flowsync2 = _interopRequireDefault(_flowsync);

var _child_process = require("child_process");

var _awsSdk = require("aws-sdk");

var _awsSdk2 = _interopRequireDefault(_awsSdk);

var _fsExtra = require("fs-extra");

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _bauerZip = require("bauer-zip");

var _bauerZip2 = _interopRequireDefault(_bauerZip);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var invokeBuilderLambdas = Symbol();
var createInvokeLambdaTask = Symbol();
var downloadObjectsFromS3 = Symbol();
var createGetObjectTask = Symbol();
var unzipLocalFile = Symbol();

var Akiro = function () {
	function Akiro() {
		var config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

		_classCallCheck(this, Akiro);

		var _ = (0, _incognito2.default)(this);

		_.config = config;
		_.config.region = _.config.region || "us-east-1";

		this.conan = _.config.conan || new _conan2.default({
			region: _.config.region,
			basePath: __dirname + "/akiro/builders/nodejs/"
		});
		this.conan.use(_conanAwsLambda2.default);

		this.Async = _.config.Async || _flowsync2.default;
		this.AWS = _.config.AWS || _awsSdk2.default;
		this.temp = _.config.temp || _temp2.default;
		this.exec = _.config.exec || _child_process.exec;
		this.execSync = _.config.execSync || _child_process.execSync;
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
			var lambdaFilePath = __dirname + "/akiro/builders/nodejs/handler.js";

			var lambda = conan.lambda(lambdaName).filePath(lambdaFilePath).role(lambdaRole).timeout(300).dependencies(__dirname + "/akiro/builders/nodejs/akiroBuilder.js");

			var createBuilderTask = function createBuilderTask(dependencyName, dependencyVersionRange, temporaryDirectoryPath) {
				return function (done) {
					var mockTemp = {
						mkdir: function mkdir(directoryName, mkdirCallback) {
							mkdirCallback(null, temporaryDirectoryPath);
						}
					};

					var event = {
						package: {
							name: dependencyName,
							version: dependencyVersionRange
						}
					};

					var npmPath = _path2.default.normalize(__dirname + "/../../node_modules/npm/bin/npm-cli.js");

					var context = {
						exec: _this.exec,
						npmPath: npmPath,
						temp: mockTemp,
						succeed: function succeed() {
							done();
						}
					};
					var builder = new _akiroBuilder2.default(event, context);
					builder.invoke(event, context);
				};
			};

			this.temp.mkdir("akiro.initialize", function (error, temporaryDirectoryPath) {
				_this.Async.series([function (done) {
					var builderDependencyTasks = [];

					for (var dependencyName in _package2.builderDependencies) {
						var dependencyVersionRange = _package2.builderDependencies[dependencyName];
						builderDependencyTasks.push(createBuilderTask(dependencyName, dependencyVersionRange, temporaryDirectoryPath));
					}

					_this.Async.series(builderDependencyTasks, done);
				}], function () {
					lambda.dependencies(temporaryDirectoryPath + "/node_modules/**/*", {
						zipPath: "/node_modules/",
						basePath: temporaryDirectoryPath + "/node_modules/"
					});
					conan.deploy(callback);
				});
			});
		}
	}, {
		key: "package",
		value: function _package(packageDetails, outputDirectoryPath, callback) {
			var _this2 = this;

			var _ = (0, _incognito2.default)(this);
			_.lambda = new this.AWS.Lambda({ region: this.config.region });
			_.s3 = new this.AWS.S3({ region: this.config.region });

			_flowsync2.default.mapParallel(Object.keys(packageDetails), function (packageName, done) {
				var packageVersionRange = packageDetails[packageName];

				var command = "npm info " + packageName + "@" + packageVersionRange + " version | tail -n 1";

				_this2.exec(command, function (error, stdout) {
					var packageLatestVersion = undefined;
					if (stdout.indexOf("@") === -1) {
						packageLatestVersion = stdout.replace("\n", "");
					} else {
						packageLatestVersion = stdout.match(/[a-zA-Z0-9]*@(.*) /)[1];
					}

					var cachedFilePath = _this2.cacheDirectoryPath + "/" + packageName + "-" + packageLatestVersion + ".zip";

					if (_fsExtra2.default.existsSync(cachedFilePath)) {
						delete packageDetails[packageName];
						_this2[unzipLocalFile](cachedFilePath, outputDirectoryPath, done);
					} else {
						packageDetails[packageName] = packageLatestVersion;
						done();
					}
				});
			}, function () {
				_this2[invokeBuilderLambdas](packageDetails, function (invokeBuilderLambdasError, data) {
					_this2[downloadObjectsFromS3](invokeBuilderLambdasError, data, outputDirectoryPath, callback);
				});
			});
		}
	}, {
		key: invokeBuilderLambdas,
		value: function value(packageDetails, callback) {
			var invokeLambdaTasks = [];
			for (var packageName in packageDetails) {
				var packageVersionRange = packageDetails[packageName];
				invokeLambdaTasks.push(this[createInvokeLambdaTask](packageName, packageVersionRange, this));
			}
			this.Async.parallel(invokeLambdaTasks, callback);
		}
	}, {
		key: createInvokeLambdaTask,
		value: function value(packageName, packageVersionRange, context) {
			return function (done) {
				var _ = (0, _incognito2.default)(context);
				console.log("Invoking AkiroBuilder: ", packageName + "@" + packageVersionRange);
				_.lambda.invoke({
					FunctionName: "AkiroBuilder", /* required */
					Payload: JSON.stringify({
						bucket: context.config.bucket,
						region: context.config.region,
						package: {
							name: packageName,
							version: packageVersionRange
						}
					})
				}, function (error, data) {
					console.log("DONE AkiroBuilder: ", packageName + "@" + packageVersionRange);
					done(error, data);
				});
			};
		}
	}, {
		key: downloadObjectsFromS3,
		value: function value(error, data, outputDirectoryPath, callback) {
			var _this3 = this;

			if (!error) {
				(function () {
					console.log("No Error in downloadObjectsFromS3");
					_fsExtra2.default.mkdirpSync(_this3.cacheDirectoryPath);

					var getObjectTasks = [];

					data.forEach(function (returnData) {
						returnData = JSON.parse(returnData.Payload);
						var fileName = returnData.fileName;
						console.log("returnData", returnData);
						getObjectTasks.push(_this3[createGetObjectTask](fileName, outputDirectoryPath, _this3));
					});

					_this3.Async.parallel(getObjectTasks, callback);
				})();
			} else {
				callback(error);
			}
		}
	}, {
		key: createGetObjectTask,
		value: function value(fileName, outputDirectoryPath, context) {
			var _this4 = this;

			var _ = (0, _incognito2.default)(this);

			return function (done) {
				var objectReadStream = _.s3.getObject({
					Bucket: context.config.bucket,
					Key: fileName
				}).createReadStream();

				var objectLocalFileName = context.cacheDirectoryPath + "/" + fileName;
				var objectWriteStream = _fsExtra2.default.createWriteStream(objectLocalFileName);

				objectWriteStream.on("close", function () {
					_this4[unzipLocalFile](objectLocalFileName, outputDirectoryPath, done);
				});

				objectReadStream.pipe(objectWriteStream);
			};
		}
	}, {
		key: unzipLocalFile,
		value: function value(localFileName, outputDirectoryPath, callback) {
			_bauerZip2.default.unzip(localFileName, outputDirectoryPath, callback);
		}
	}, {
		key: "config",
		get: function get() {
			return (0, _incognito2.default)(this).config;
		}
	}]);

	return Akiro;
}();

exports.default = Akiro;