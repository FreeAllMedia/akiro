import AkiroPackager from "../../../../lib/akiro/packagers/nodejs/akiroPackager.js";
import sinon from "sinon";
import temp from "temp";
import packageJson from "../../../../../package.json";
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
			mockS3,

			s3ConstructorSpy;

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
			bucket: "akiro.test",
			fileName: "copyToS3.zip",
			package: {
				name: "async",
				version: packageJson.dependencies.async
			}
		};

		nodeModulesDirectoryPath = `${__dirname}/../../../../../node_modules`;

		mockExec = createMockExec(temporaryDirectoryPath, nodeModulesDirectoryPath);
		mockNpmPath = `${nodeModulesDirectoryPath}/npm`;
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

	it("should instantiate S3 with the designated region", () => {
		s3ConstructorSpy.calledWith({
			region: event.region
		});
	});

	it("should copy the .zip file to the designated S3 options", () => {
		const putObjectParameters = {
			Bucket: "",
			Key: "",
			Body: ""
		};
		mockS3.putObject.calledWith().should.be.true;
	});
});
