import AkiroBuilder from "../../../../lib/akiro/builders/nodejs/akiroBuilder.js";
import sinon from "sinon";
import temp from "temp";
import fileSystem from "fs-extra";
import packageJson from "../../../../../package.json";
import createMockExec from "../../../helpers/mockExec.js";
import createMockTemp from "../../../helpers/mockTemp.js";

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
			package: {
				name: "async",
				version: packageJson.dependencies.async
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

	it("should use npm to install and build all designated packages", () => {
		const asyncFileNames = fileSystem.readdirSync(`${temporaryDirectoryPath}/node_modules/async`);
		const expectedAsyncFileNames = fileSystem.readdirSync(`${nodeModulesDirectoryPath}/async`);

		asyncFileNames.should.have.members(expectedAsyncFileNames);
	});
});
