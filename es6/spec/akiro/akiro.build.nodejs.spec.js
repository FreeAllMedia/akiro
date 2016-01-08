import Akiro from "../../lib/akiro.js";
import temp from "temp";
import fileSystem from "fs";
import unzip from "unzip2";
import stream from "stream";
import glob from "glob";
import path from "path";

import {dependencies} from "../../../package.json";

xdescribe("akiro.build(filePath, callback)", () => {
	let config,
			akiro,
			filePath;

	beforeEach(done => {
		temp.track();

		config = {};

		akiro = new Akiro(config);

		temp.mkdir("akiro_build", (error, tempDirectoryPath) => {
			filePath = `${tempDirectoryPath}/akiro.packager.zip`;
			akiro.build(filePath, done);
		});
	});

	afterEach(done => {
		temp.cleanup(done);
	});

	it("should build an Akiro Packager zip file", () => {
		fileSystem.existsSync(filePath).should.be.true;
	});

	describe("(Zip File)", () => {
		/* eslint-disable new-cap */
		let files,
				filePaths,

				lambdaFilePath,
				lambdaFile;

		beforeEach(done => {
			lambdaFilePath = __dirname + "/../../lib/akiro/packagers/nodejs/akiro.packager.nodejs.js";

			files = [];

			fileSystem.createReadStream(filePath)
				.pipe(unzip.Parse())
				.on("entry", (entry) => {
					if (entry.path === "lambda.js") {
						lambdaFile = entry;
					}
					files.push(entry);
				})
				.on("close", () => {
					filePaths = files.map((file) => { return file.path; });
					done();
				});
		});

		it("should contain the Akiro Packager lambda", () => {
			filePaths.should.include("lambda.js");
		});

		it("should insert the correct data for Akiro Packager lambda", done => {
			/* eslint-disable new-cap */
			const lambdaFileData = fileSystem.readFileSync(lambdaFilePath);

			const Writable = stream.Writable;
			const writableStream = Writable({ objectMode: true });
			writableStream._write = (chunk) => {
				chunk.should.eql(lambdaFileData);
				done();
			};
			lambdaFile.pipe(writableStream);
		});

		it("should contain all Akiro Packager dependencies", done => {
			let expectedFilePaths = [	"lambda.js" ];

			const rootDirectoryPath = `${__dirname}/../../../`;
			const nodeModulesDirectoryPath = `${rootDirectoryPath}node_modules/`;

			for(let dependencyName in dependencies) {
				const moduleFilesGlob = `${nodeModulesDirectoryPath}${dependencyName}/**/*`;
				glob(moduleFilesGlob, addToExpectedFilePaths);
			}

			function addToExpectedFilePaths(error, moduleFilePaths) {
				if (error) { throw error; }
				moduleFilePaths.forEach((moduleFilePath) => {
					const relativeModuleFilePath = path.relative(rootDirectoryPath, moduleFilePath);
					expectedFilePaths.push(relativeModuleFilePath);
				});
			}

			let actualFilePaths = [];

			fileSystem.createReadStream(filePath)
				.pipe(unzip.Parse())
				.on("entry", (entry) => {
					actualFilePaths.push(entry.path);
					files.push(entry);
				})
				.on("close", () => {
					actualFilePaths.should.eql(expectedFilePaths);
					done();
				});
		});
	});
});
