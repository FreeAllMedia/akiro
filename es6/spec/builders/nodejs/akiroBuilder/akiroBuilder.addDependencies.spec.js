import AkiroBuilder from "../../../../lib/akiro/builders/nodejs/akiroBuilder.js";
import sinon from "sinon";
import temp from "temp";
import { exec } from "child_process";
import packageJson from "../../../../../package.json";
import AWS from "aws-sdk";
import createMockExec from "../../../helpers/mockExec.js";
import createMockTemp from "../../../helpers/mockTemp.js";
import fileSystem from "fs-extra";
import path from "path";

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

		nodeModulesDirectoryPath = path.normalize(`${__dirname}/../../../../../node_modules`);

		mockNpmPath = `${nodeModulesDirectoryPath}/npm/bin/npm-cli.js`;
		mockExec = createMockExec({
			[`cd ${temporaryDirectoryPath};node ${mockNpmPath} install`]: execDone => execDone(),
			[`cd ${temporaryDirectoryPath};node ${mockNpmPath} init -y`]: execDone => {
				fileSystem.copySync(`${__dirname}/../../../fixtures/newPackage.json`, `${temporaryDirectoryPath}/package.json`);
				execDone();
			},
			[`node ${mockNpmPath} info .*`]: execDone => {
				execDone(null, "1.5.0");
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
			succeed: (data) => { done(null, data); },
			fail: done
		};

		akiroBuilder = new AkiroBuilder(event, context);
		akiroBuilder.invoke(event, context);
	});

	it("should add the designated packages as dependencies in the new package.json", () => {
		const newPackageJson = require(`${temporaryDirectoryPath}/package.json`);
		newPackageJson.dependencies.should.eql({[event.package.name]: event.package.version});
	});
});
