import AkiroPackager from "../../../../lib/akiro/packagers/nodejs/akiroPackager.js";
import sinon from "sinon";
import temp from "temp";
import { exec } from "child_process";
import packageJson from "../../../../../package.json";
import AWS from "aws-sdk";
import createMockExec from "../../../helpers/mockExec.js";
import createMockTemp from "../../../helpers/mockTemp.js";

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

	describe("akiroPackager.temp", () => {
		it("should be set to context.temp if provided", () => {
			akiroPackager.temp.should.eql(mockTemp);
		});

		it("should be set to the temp package if not provided", () => {
			context.temp = undefined;
			akiroPackager = new AkiroPackager(event, context);
			akiroPackager.temp.should.eql(temp);
		});
	});

	describe("akiroPackager.npmPath", () => {
		it("should be set to context.npmPath if provided", () => {
			akiroPackager.npmPath.should.eql(mockNpmPath);
		});

		it("should be set to the npmPath package if not provided", () => {
			context.npmPath = undefined;
			akiroPackager = new AkiroPackager(event, context);
			akiroPackager.npmPath.should.eql("./node_modules/npm");
		});
	});

	describe("akiroPackager.exec", () => {
		it("should be set to context.exec if provided", () => {
			akiroPackager.exec.should.eql(mockExec);
		});

		it("should be set to the exec package if not provided", () => {
			context.exec = undefined;
			akiroPackager = new AkiroPackager(event, context);
			akiroPackager.exec.should.eql(exec);
		});
	});

	describe("akiroPackager.AWS", () => {
		it("should be set to context.AWS if provided", () => {
			akiroPackager.AWS.should.eql(mockAWS);
		});

		it("should be set to the AWS package if not provided", () => {
			context.AWS = undefined;
			akiroPackager = new AkiroPackager(event, context);
			akiroPackager.AWS.should.eql(AWS);
		});
	});
});
