"use strict";

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _libAkiroJs = require("../../lib/akiro.js");

var _libAkiroJs2 = _interopRequireDefault(_libAkiroJs);

var _temp = require("temp");

var _temp2 = _interopRequireDefault(_temp);

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _unzip2 = require("unzip2");

var _unzip22 = _interopRequireDefault(_unzip2);

var _stream = require("stream");

var _stream2 = _interopRequireDefault(_stream);

describe("akiro.build(filePath, callback)", function () {
	var akiro = undefined,
	    filePath = undefined;

	beforeEach(function (done) {
		_temp2["default"].track();

		var config = {};

		akiro = new _libAkiroJs2["default"](config);

		_temp2["default"].mkdir("akiro_build", function (error, tempDirectoryPath) {
			filePath = tempDirectoryPath + "/akiro.packager.zip";
			akiro.build(filePath, done);
		});
	});

	afterEach(function (done) {
		_temp2["default"].cleanup(done);
	});

	it("should build an Akiro Packager zip file", function () {
		_fs2["default"].existsSync(filePath).should.be["true"];
	});

	describe("(Zip File)", function () {
		/* eslint-disable new-cap */
		var files = undefined,
		    filePaths = undefined,
		    lambdaFilePath = undefined,
		    lambdaFile = undefined;

		beforeEach(function (done) {
			lambdaFilePath = __dirname + "/../../lib/akiro/packagers/nodejs/akiro.packager.nodejs.js";

			files = [];

			_fs2["default"].createReadStream(filePath).pipe(_unzip22["default"].Parse()).on("entry", function (entry) {
				if (entry.path === "lambda.js") {
					lambdaFile = entry;
				}
				files.push(entry);
			}).on("close", function () {
				filePaths = files.map(function (file) {
					return file.path;
				});
				done();
			});
		});

		it("should contain the Akiro Packager lambda", function () {
			filePaths.should.include("lambda.js");
		});

		it("should insert the correct data for Akiro Packager lambda", function (done) {
			/* eslint-disable new-cap */
			var lambdaFileData = _fs2["default"].readFileSync(lambdaFilePath);

			var Writable = _stream2["default"].Writable;
			var writableStream = Writable({ objectMode: true });
			writableStream._write = function (chunk) {
				chunk.should.eql(lambdaFileData);
				done();
			};
			lambdaFile.pipe(writableStream);
		});

		xit("should contain all Akiro Packager dependencies", function () {
			filePaths.should.eql(["lambda.js"]);
		});
	});
});