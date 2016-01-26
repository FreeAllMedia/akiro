import AkiroBuilder from "../../../../lib/akiro/builders/nodejs/akiroBuilder.js";
import sinon from "sinon";
import temp from "temp";
import { exec } from "child_process";
import packageJson from "../../../../../package.json";
import AWS from "aws-sdk";
import createMockExec from "../../../helpers/mockExec.js";
import createMockTemp from "../../../helpers/mockTemp.js";
import fileSystem from "fs-extra";

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
			mockS3,
			mockFileSystem;

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
			[`cd ${temporaryDirectoryPath};node ${mockNpmPath} install`]: execDone => execDone(),
			[`cd ${temporaryDirectoryPath};node ${mockNpmPath} init -y`]: execDone => {
				fileSystem.copySync(`${__dirname}/../../../fixtures/newPackage.json`, `${temporaryDirectoryPath}/package.json`);
				execDone();
			},
			["npm info .*"]: execDone => {
				execDone(null, "1.5.0");
			}
		});
		mockTemp = createMockTemp(temporaryDirectoryPath);
		mockFileSystem = {
			writeFile: sinon.spy(fileSystem.writeFile),
			statSync: sinon.spy(fileSystem.statSync),
			createReadStream: sinon.spy(fileSystem.createReadStream),
			createWriteStream: sinon.spy(fileSystem.createWriteStream),
			copy: sinon.spy(fileSystem.copy)
		};

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
			fileSystem: mockFileSystem,
			succeed: (data) => { done(null, data); },
			fail: done
		};

		akiroBuilder = new AkiroBuilder(event, context);
		akiroBuilder.invoke(event, context);
	});

	describe("akiroBuilder.temp", () => {
		it("should be set to context.temp if provided", () => {
			akiroBuilder.temp.should.eql(mockTemp);
		});

		it("should be set to the temp package if not provided", () => {
			context.temp = undefined;
			akiroBuilder = new AkiroBuilder(event, context);
			akiroBuilder.temp.should.eql(temp);
		});
	});

	describe("akiroBuilder.npmPath", () => {
		it("should be set to context.npmPath if provided", () => {
			akiroBuilder.npmPath.should.eql(mockNpmPath);
		});

		it("should be set to the npmPath package if not provided", () => {
			context.npmPath = undefined;
			akiroBuilder = new AkiroBuilder(event, context);
			akiroBuilder.npmPath.should.eql("./node_modules/npm/bin/npm-cli.js");
		});
	});

	describe("akiroBuilder.exec", () => {
		it("should be set to context.exec if provided", () => {
			akiroBuilder.exec.should.eql(mockExec);
		});

		it("should be set to the exec package if not provided", () => {
			context.exec = undefined;
			akiroBuilder = new AkiroBuilder(event, context);
			akiroBuilder.exec.should.eql(exec);
		});
	});

	describe("akiroBuilder.AWS", () => {
		it("should be set to context.AWS if provided", () => {
			akiroBuilder.AWS.should.eql(mockAWS);
		});

		it("should be set to the AWS package if not provided", () => {
			context.AWS = undefined;
			akiroBuilder = new AkiroBuilder(event, context);
			akiroBuilder.AWS.should.eql(AWS);
		});
	});

	describe("akiroBuilder.fileSystem", () => {
		it("should be set to context.fileSystem if provided", () => {
			akiroBuilder.fileSystem.should.eql(mockFileSystem);
		});

		it("should be set to the fileSystem package if not provided", () => {
			context.fileSystem = undefined;
			akiroBuilder = new AkiroBuilder(event, context);
			akiroBuilder.fileSystem.should.eql(fileSystem);
		});
	});
});
