import AkiroBuilder from "../../../../lib/akiro/builders/nodejs/akiroBuilder.js";
import sinon from "sinon";
import temp from "temp";
import packageJson from "../../../../../package.json";
import fileSystem from "fs-extra";
import createMockExec from "../../../helpers/mockExec.js";
import createMockTemp from "../../../helpers/mockTemp.js";
import glob from "glob";
import unzip from "unzip2";
import difference from "array-difference";

temp.track();

describe("AkiroBuilder(event, context)", () => {
	let event,
			context,
			akiroBuilder,

			nodeModulesDirectoryPath,
			temporaryDirectoryPath,

			mockExec,
			mockNpmPath,
			mockTemp,
			mockAWS,
			mockS3;

	beforeEach((done) => {
		temp.mkdir("akiroBuilder", (error, newTemporaryDirectoryPath) => {
			temporaryDirectoryPath = newTemporaryDirectoryPath;
			done();
		});
	});

	afterEach(done => {
		temp.cleanup(done);
	});

	beforeEach(function (done) {


		event = {
			region: "us-east-1",
			package: {
				name: "async",
				version: packageJson.dependencies.async
			}
		};

		nodeModulesDirectoryPath = `${__dirname}/../../../../../node_modules`;

		mockNpmPath = `${nodeModulesDirectoryPath}/npm/bin/npm-cli.js`;
		mockExec = createMockExec({
			[`cd ${temporaryDirectoryPath};node ${mockNpmPath} init -y`]:	(commandDone) => {
				fileSystem.copySync(`${__dirname}/../../../fixtures/newPackage.json`, `${temporaryDirectoryPath}/package.json`);
				commandDone();
			}
		});
		mockTemp = createMockTemp(temporaryDirectoryPath);

		mockS3 = {
			putObject: sinon.spy((parameters, callback) => {
				callback();
			})
		};

		class MockS3 {
			constructor() {
				return mockS3;
			}
		}

		mockAWS = {
			S3: MockS3
		};

		context = {
			AWS: mockAWS,
			exec: mockExec,
			npmPath: mockNpmPath,
			temp: mockTemp,
			succeed: done,
			fail: done
		};

		akiroBuilder = new AkiroBuilder(event, context);
		akiroBuilder.invoke(event, context);
	});

	it("should add all designated package code to a .zip file", function (done) {
		/* eslint-disable new-cap */


		const zipFilePath = `${temporaryDirectoryPath}/package.zip`;

		let asyncFilePaths = glob.sync(`${temporaryDirectoryPath}/node_modules/async/**/*`, { dot: true });
		let npmFilePaths = glob.sync(`${temporaryDirectoryPath}/node_modules/npm/**/*`, { dot: true });

		asyncFilePaths = asyncFilePaths.filter(filterDirectories);
		npmFilePaths = npmFilePaths.filter(filterDirectories);

		function filterDirectories(filePath) {
			return !fileSystem.statSync(filePath).isDirectory();
		}

		let expectedFilePaths = asyncFilePaths.concat(npmFilePaths);
		expectedFilePaths = expectedFilePaths.map((filePath) => {
			const relativePath = filePath.replace(`${temporaryDirectoryPath}/node_modules/`, "");
			return relativePath;
		});

		let filePaths = [];
		fileSystem.createReadStream(zipFilePath)
			.pipe(unzip.Parse())
			.on("entry", (entry) => {
				filePaths.push(entry.path);
			})
			.on("close", () => {
				difference(expectedFilePaths, filePaths).should.eql([]);
				done();
			});
	});
});
