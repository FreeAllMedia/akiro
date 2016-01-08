"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports["default"] = build;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _archiver = require("archiver");

var _archiver2 = _interopRequireDefault(_archiver);

function build(filePath, callback) {
	var zipData = _archiver2["default"].create("zip", {});

	var lambdaData = _fs2["default"].createReadStream(__dirname + "/packagers/nodejs/akiro.packager.nodejs.js");

	zipData.append(lambdaData, { name: "lambda.js" });

	var zipFile = _fs2["default"].createWriteStream(filePath);
	zipFile.on("close", function () {
		callback();
	});

	zipData.pipe(zipFile);
	zipData.finalize();
}

module.exports = exports["default"];