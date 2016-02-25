"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AkiroBuilder = function () {
	function AkiroBuilder(event, context) {
		_classCallCheck(this, AkiroBuilder);

		this.AWS = context.AWS || _awsSdk2.default;
		this.exec = context.exec || _child_process.exec;
		this.temp = context.temp || _temp2.default;
		this.fileSystem = context.fileSystem || _fsExtra2.default;
		this.npmPath = context.npmPath || __dirname + "/node_modules/npm/bin/npm-cli.js";
	}

	_createClass(AkiroBuilder, [{
		key: "status",
		value: function status(message) {
			console.log(message);
		}
	}, {
		key: "invoke",
		value: function invoke(event, context) {
			var _this = this;

			var parameters = {};

			_flowsync2.default.series([function (done) {
				_this.status("Creating temporary directory");
				_this.temp.mkdir("akiroBuilder", function (error, temporaryDirectoryPath) {
					_this.status("Temporary directory created: " + temporaryDirectoryPath);
					parameters.temporaryDirectoryPath = temporaryDirectoryPath;
					done(error);
				});
			}, function (done) {
				_this.status("Creating blank package.json file");
				var temporaryDirectoryPath = parameters.temporaryDirectoryPath;
				var commands = ["cd " + temporaryDirectoryPath, "node " + _this.npmPath + " init -y"];
				_this.exec(commands.join(";"), function (initError) {
					_this.status("Blank package.json file created.");
					done(initError);
				});
			}, function (done) {
				_this.status("Adding dependencies to package.json");
				var temporaryDirectoryPath = parameters.temporaryDirectoryPath;
				var packageJsonFilePath = temporaryDirectoryPath + "/package.json";
				var packageJson = require(packageJsonFilePath);
				packageJson.description = "Temporary AkiroBuilder package.json for generation.";
				packageJson.repository = "https://this.doesntreallyexist.com/something.git";
				packageJson.dependencies = _defineProperty({}, event.package.name, event.package.version);
				_this.fileSystem.writeFile(packageJsonFilePath, JSON.stringify(packageJson), function (error) {
					_this.status("Dependencies added to package.json");
					done(error);
				});
			}, function (done) {
				_this.status("Installing dependencies");
				var temporaryDirectoryPath = parameters.temporaryDirectoryPath;
				var commands = ["cd " + temporaryDirectoryPath, "node " + _this.npmPath + " install --production"];
				_this.exec(commands.join(";"), function (error, stdout) {
					_this.status("Dependencies installed: " + stdout);
					done(error);
				});
			}, function (done) {
				var temporaryDirectoryPath = parameters.temporaryDirectoryPath;
				var packagesZip = (0, _archiver2.default)("zip", {});
				var nodeModulesGlob = temporaryDirectoryPath + "/node_modules/**/*";

				_this.status("Adding files to package zip: " + nodeModulesGlob);

				(0, _glob2.default)(nodeModulesGlob, { dot: true }, function (error, filePaths) {
					_this.status("Number of files found with glob: " + filePaths.length);
					filePaths.forEach(function (filePath) {
						var isDirectory = _this.fileSystem.statSync(filePath).isDirectory();
						if (!isDirectory) {
							var fileBuffer = _this.fileSystem.readFileSync(filePath);

							//const fileReadStream = this.fileSystem.createReadStream(filePath);
							var relativeFilePath = _path2.default.relative(temporaryDirectoryPath + "/node_modules/", filePath).replace(temporaryDirectoryPath, "");
							//this.status(`Adding "${filePath}" as "${relativeFilePath}"`);
							packagesZip.append(fileBuffer, { name: relativeFilePath });
						}
					});
					_this.status("Done adding files to package zip.");

					_this.exec("df", function (dfError, stdout) {
						_this.status(stdout);
					});

					var zipFileWriteStream = _this.fileSystem.createWriteStream(temporaryDirectoryPath + "/package.zip");

					zipFileWriteStream.on("close", function () {
						_this.status("Finished saving package zip");
						done(null);
					});

					packagesZip.pipe(zipFileWriteStream);
					packagesZip.finalize();
				});
			}, function (done) {
				if (event.region && event.bucket) {
					(function () {
						var temporaryDirectoryPath = parameters.temporaryDirectoryPath;
						var version = event.package.version;
						var s3 = new _this.AWS.S3({ region: event.region });

						var packageZipFilePath = temporaryDirectoryPath + "/package.zip";

						var packageZipReadBuffer = _this.fileSystem.readFileSync(packageZipFilePath);

						var fileName = event.package.name + "-" + version + ".zip";

						parameters.fileName = fileName;

						_this.status("Saving package zip to S3 as: " + event.bucket + "/" + fileName);

						s3.putObject({
							Bucket: event.bucket,
							Key: fileName,
							Body: packageZipReadBuffer
						}, function () {
							_this.status("Finished saving package zip to S3 as: " + event.bucket + "/" + fileName);
							done.apply(undefined, arguments);
						});
					})();
				} else {
					_this.status("Region or Bucket not set: " + event.region + " - " + event.bucket);
					done();
				}
			}, function (done) {
				if (context.localFilePath) {
					var temporaryDirectoryPath = parameters.temporaryDirectoryPath;
					var packageZipFilePath = temporaryDirectoryPath + "/package.zip";
					_fsExtra2.default.copy(packageZipFilePath, context.localFilePath, done);
				} else {
					_this.status("No local file path set.");
					done();
				}
			}], function (error) {
				if (error) {
					_this.status("There was an error! " + error);
					context.fail(error);
				} else {
					_this.status("SUCCESS! " + parameters.fileName);
					context.succeed({
						fileName: parameters.fileName
					});
				}
			});

			this.status("End of .invoke()");
		}
	}]);

	return AkiroBuilder;
}();

exports.default = AkiroBuilder;