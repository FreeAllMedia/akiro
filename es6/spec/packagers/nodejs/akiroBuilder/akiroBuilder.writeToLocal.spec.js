import AkiroBuilder from "../../../../lib/akiro/builders/nodejs/akiroBuilder.js";
import sinon from "sinon";
import temp from "temp";
import asyncPackageJson from "../../../../../node_modules/async/package.json";
import createMockExec from "../../../helpers/mockExec.js";
import createMockTemp from "../../../helpers/mockTemp.js";
import fileSystem from "fs-extra";

temp.track();

xdescribe("AkiroBuilder(event, context)", () => {
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
			region: "us-east-1",
			bucket: "akiro.test",
			package: {
				name: "async",
				version: "1.0.0"
			}
		};

		nodeModulesDirectoryPath = `${__dirname}/../../../../../node_modules`;

		mockNpmPath = `${nodeModulesDirectoryPath}/npm/bin/npm-cli.js`;
		mockExec = createMockExec(temporaryDirectoryPath, nodeModulesDirectoryPath, mockNpmPath);
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

		context = {
			localFilePath: `${temporaryDirectoryPath}/local.zip`,
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

	describe("(With context.localFilePath set)", () => {
		it("should copy the .zip file to the designated local file path", () => {
			fileSystem.existsSync(context.localFilePath).should.be.true;
		});
		it("should copy the .zip file to the designated local file path", () => {
			const expectedFileData = fileSystem.readFileSync(`${__dirname}/../../../fixtures/async-1.0.0.zip`);
			const fileData = fileSystem.readFileSync(context.localFilePath);
			fileData.should.eql(expectedFileData);
		});
	});

	describe("(WITHOUT context.localFilePath set)", () => {
		beforeEach(done => {
			context.localFilePath = undefined;

			context.succeed = done;

			akiroBuilder = new AkiroBuilder(event, context);
			akiroBuilder.invoke(event, context);
		});

		it("should copy the .zip file to the designated local file path", () => {
			const zipFileName = `${event.package.name}-${asyncPackageJson.version}.zip`;
			const zipFileData = fileSystem.readFileSync(`${__dirname}/../../../fixtures/async-1.0.0.zip`);
			const putObjectParameters = {
				Bucket: event.bucket,
				Key: zipFileName,
				Body: zipFileData
			};
			mockS3.putObject.calledWith(putObjectParameters);
		});
	});
});
