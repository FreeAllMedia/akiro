import AkiroBuilder from "../../../../lib/akiro/builders/nodejs/akiroBuilder.js";
import sinon from "sinon";
import temp from "temp";
import createMockExec from "../../../helpers/mockExec.js";
import createMockTemp from "../../../helpers/mockTemp.js";
import fileSystem from "fs-extra";
import unzip from "unzip2";
import Async from "flowsync";
import path from "path";

temp.track();

describe("AkiroBuilder(event, context)", () => {
	let event,
			context,
			akiroBuilder,

			localFilePath,
			nodeModulesDirectoryPath,
			temporaryDirectoryPath,

			mockExec,
			mockNpmPath,
			mockTemp,
			mockAWS,
			mockS3,

			s3ConstructorSpy;

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
			package: {
				name: "async",
				version: "1.0.0"
			}
		};

		nodeModulesDirectoryPath = path.normalize(`${__dirname}/../../../../../node_modules`);

		mockNpmPath = `${nodeModulesDirectoryPath}/npm/bin/npm-cli.js`;
		mockExec = createMockExec({
			[`cd ${temporaryDirectoryPath};node ${mockNpmPath} install`]: (commandDone) => {
				fileSystem.copy(`${nodeModulesDirectoryPath}/async`, `${temporaryDirectoryPath}/node_modules/async`, (error) => {
					commandDone(error);
				});
			},
			[`cd ${temporaryDirectoryPath};node ${mockNpmPath} init -y`]: execDone => {
				fileSystem.copySync(`${__dirname}/../../../fixtures/newPackage.json`, `${temporaryDirectoryPath}/package.json`);
				execDone();
			},
			[`node ${mockNpmPath} info .*`]: execDone => {
				execDone(null, "1.5.0");
			}
		});
		mockTemp = createMockTemp(temporaryDirectoryPath);

		s3ConstructorSpy = sinon.spy();

		mockS3 = {
			putObject: sinon.spy((parameters, callback) => {
				callback();
			})
		};

		class MockS3 {
			constructor(config) {
				s3ConstructorSpy(config);
				return mockS3;
			}
		}

		mockAWS = {
			S3: MockS3
		};

		localFilePath = `${temporaryDirectoryPath}/local.zip`;

		context = {
			localFilePath: localFilePath,
			AWS: mockAWS,
			exec: mockExec,
			npmPath: mockNpmPath,
			temp: mockTemp,
			succeed: (data) => { done(null, data); },
			fail: done
		};

		akiroBuilder = new AkiroBuilder(event, context);
		akiroBuilder.invoke(event, context);
	});

	describe("(With context.localFilePath set)", () => {
		it("should copy the .zip file to the designated local file path", () => {
			/* eslint-disable new-cap */
			const zipFixturePath = `${__dirname}/../../../fixtures/async-1.5.2.zip`;

			let localFilePaths = [];
			let expectedFilePaths = [];
			Async.series([
				(done) => {
					fileSystem.createReadStream(context.localFilePath)
						.pipe(unzip.Parse())
						.on("entry", (entry) => {
							localFilePaths.push(entry.path);
						})
						.on("close", done);
				},
				(done) => {
					fileSystem.createReadStream(zipFixturePath)
						.pipe(unzip.Parse())
						.on("entry", (entry) => {
							expectedFilePaths.push(entry.path);
						})
						.on("close", done);
				}
			], () => {
				localFilePaths.should.eql(expectedFilePaths);
			});
		});
	});

	describe("(WITHOUT context.localFilePath set)", () => {
		beforeEach(done => {
			fileSystem.unlinkSync(localFilePath);
			context.localFilePath = undefined;

			context.succeed = (data) => { done(null, data); };

			akiroBuilder = new AkiroBuilder(event, context);
			akiroBuilder.invoke(event, context);
		});

		it("should not copy the .zip file to a local file path", () => {
			fileSystem.existsSync(localFilePath).should.be.false;
		});
	});
});
