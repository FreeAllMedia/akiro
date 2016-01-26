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
			succeed: (data) => { done(null, data); },
			fail: done
		};

		akiroBuilder = new AkiroBuilder(event, context);
		akiroBuilder.invoke(event, context);
	});

	describe("(With event.bucket and event.region set)", () => {
		it("should instantiate S3 with the designated region", () => {
			s3ConstructorSpy.calledWith({
				region: event.region
			}).should.be.true;
		});

		it("should copy the .zip file to the designated S3 options", () => {
			const zipFileName = `${event.package.name}-${asyncPackageJson.version}.zip`;
			const zipFileData = fileSystem.readFileSync(`${__dirname}/../../../fixtures/async-1.5.2.zip`);
			const putObjectParameters = {
				Bucket: event.bucket,
				Key: zipFileName,
				Body: zipFileData
			};
			mockS3.putObject.calledWith(putObjectParameters);
		});
	});

	describe("(WITHOUT event.bucket or event.region set)", () => {
		beforeEach(done => {
			event.region = undefined;
			event.bucket = undefined;

			context.succeed = (data) => { done(null, data); };

			akiroBuilder = new AkiroBuilder(event, context);
			akiroBuilder.invoke(event, context);
		});

		it("should NOT instantiate S3 with the designated region", () => {
			s3ConstructorSpy.calledWith({
				region: event.region
			}).should.be.false;
		});
	});
});
