import AkiroPackager from "../../../../lib/akiro/packagers/nodejs/akiroPackager.js";
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

describe("AkiroPackager(event, context)", () => {
	let event,
			context,
			akiroPackager,

			nodeModulesDirectoryPath,
			temporaryDirectoryPath,

			mockExec,
			mockNpmPath,
			mockTemp,
			mockAWS,
			mockS3;

	beforeEach((done) => {
		temp.mkdir("akiroPackager", (error, newTemporaryDirectoryPath) => {
			temporaryDirectoryPath = newTemporaryDirectoryPath;
			done();
		});
	});

	afterEach(done => {
		temp.cleanup(done);
	});

	beforeEach(function (done) {
		this.timeout(60000);

		event = {
			region: "us-east-1",
			package: {
				name: "async",
				version: packageJson.dependencies.async
			}
		};

		nodeModulesDirectoryPath = `${__dirname}/../../../../../node_modules`;

		mockExec = createMockExec(temporaryDirectoryPath, nodeModulesDirectoryPath);
		mockNpmPath = `${nodeModulesDirectoryPath}/npm`;
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

		akiroPackager = new AkiroPackager(event, context);
		akiroPackager.invoke(event, context);
	});

	it("should add all designated package code to a .zip file", function (done) {
		/* eslint-disable new-cap */
		this.timeout(60000);

		const zipFilePath = `${temporaryDirectoryPath}/packages.zip`;

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
