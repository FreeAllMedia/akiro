import AkiroBuilder from "../../../../lib/akiro/builders/nodejs/akiroBuilder.js";
import sinon from "sinon";
import temp from "temp";
import asyncPackageJson from "../../../../../node_modules/async/package.json";
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
			mockAWS,
			mockS3,
			mockTemp,

			succeedData;

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
		mockExec = createMockExec({
			[`cd ${temporaryDirectoryPath};node ${mockNpmPath} install`]: execDone => execDone(),
			[`cd ${temporaryDirectoryPath};node ${mockNpmPath} init -y`]: execDone => {
				fileSystem.copySync(`${__dirname}/../../../fixtures/newPackage.json`, `${temporaryDirectoryPath}/package.json`);
				execDone();
			},
			["npm info .*"]: execDone => {
				execDone(null, event.package.version);
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
			temp: mockTemp,
			npmPath: mockNpmPath,
			succeed: (data) => {
				succeedData = data;
				done();
			}
		};

		akiroBuilder = new AkiroBuilder(event, context);
		akiroBuilder.invoke(event, context);
	});

	it("should return an object containing the file name", () => {
		succeedData.fileName.should.eql("async-1.0.0.zip");
	});
});
