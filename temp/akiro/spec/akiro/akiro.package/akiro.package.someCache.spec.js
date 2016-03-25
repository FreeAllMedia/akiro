import Akiro from "../../../lib/akiro.js";
import temp from "temp";
import sinon from "sinon";
import Async from "flowsync";
import glob from "glob";
import fileSystem from "fs-extra";
import path from "path";

temp.track();

describe("akiro.package(packageDetails, outputDirectoryPath, callback)", () => {
	let config,
			akiro,

			packageDetails,

			cacheDirectoryPath,
			outputDirectoryPath,

			asyncZipFileName,
			asyncZipFilePath,

			mockAsync,
			mockAWS,
			mockS3,
			mockLambda,

			lambdaConstructorSpy,
			s3ConstructorSpy;

	beforeEach(function (done) {
		this.timeout(10000);

		packageDetails = {
			"async": "1.x.x",
			"incognito": "0.1.4"
		};

		outputDirectoryPath = temp.mkdirSync("akiro.output");
		cacheDirectoryPath = temp.mkdirSync("akiro.cache");

		lambdaConstructorSpy = sinon.spy();
		s3ConstructorSpy = sinon.spy();

		mockAsync = {
			parallel: sinon.spy(Async.parallel)
		};

		mockLambda = {
			invoke: sinon.spy((parameters, invokeCallback) => {
				const payloadData = JSON.parse(parameters.Payload);
				const packageName = payloadData.package.name;
				const packageVersion = payloadData.package.version;

				invokeCallback(null, {
					Payload: `{ "fileName": "${packageName}-${packageVersion}.zip" }`
				});
			})
		};

		asyncZipFileName = "async-1.5.2.zip";
		asyncZipFilePath = `${__dirname}/../../fixtures/${asyncZipFileName}`;

		const mockS3GetObjectAsyncRequest = {
			createReadStream: () => {
				return fileSystem.createReadStream(asyncZipFilePath);
			}
		};

		const mockS3GetObjectIncognitoRequest = {
			createReadStream: () => {
				return fileSystem.createReadStream(`${__dirname}/../../fixtures/incognito-0.1.4.zip`);
			}
		};

		mockS3 = {
			getObject: sinon.spy((parameters) => {
				switch (parameters.Key) {
					case "async-1.5.2.zip":
						return mockS3GetObjectAsyncRequest;
					case "incognito-0.1.4.zip":
						return mockS3GetObjectIncognitoRequest;
					default:
						throw parameters.Key;
				}
			})
		};

		class MockS3 {
			constructor(s3Config) {
				s3ConstructorSpy(s3Config);
				return mockS3;
			}
		}

		class MockLambda {
			constructor(lambdaConfig) {
				lambdaConstructorSpy(lambdaConfig);
				return mockLambda;
			}
		}

		mockAWS = {
			S3: MockS3,
			Lambda: MockLambda
		};

		config = {
			region: "us-east-1",
			bucket: "akiro.test",
			AWS: mockAWS,
			Async: mockAsync,
			cacheDirectoryPath: cacheDirectoryPath
		};

		fileSystem.copySync(asyncZipFilePath, `${cacheDirectoryPath}/${asyncZipFileName}`);
		akiro = new Akiro(config);
		akiro.package(packageDetails, outputDirectoryPath, done);
	});

	afterEach((done) => {
		temp.cleanup(done);
	});

	describe("(When some local cached versions are available)", () => {
		it("should not invoke the package lambda for the cached versions", () => {
			const expectedParameters = {
				FunctionName: "AkiroBuilder", /* required */
				Payload: JSON.stringify({
					bucket: config.bucket,
					region: config.region,
					package: {
						name: "async",
						version: packageDetails.async
					}
				})
			};
			mockLambda.invoke.calledWith(expectedParameters).should.be.false;
		});

		it("should not download the package from S3 for the cached versions", () => {
			const expectedParameters = {
				Bucket: config.bucket,
				Key: "async-1.5.2.zip"
			};
			mockS3.getObject.calledWith(expectedParameters).should.be.false;
		});

		it("should copy all package files to the output directory", () => {
			const outputDirectoryFilePaths = glob.sync(`${outputDirectoryPath}/**/*`, { dot: true }).map((filePath) => {
				return filePath.replace(outputDirectoryPath, "");
			});

			const fixturesOutputDirectoryPath = path.normalize(`${__dirname}/../../fixtures/output`);
			const expectedFilePaths = glob.sync(`${fixturesOutputDirectoryPath}/**/*`, { dot: true }).map((filePath) => {
				return filePath.replace(fixturesOutputDirectoryPath, "");
			});

			outputDirectoryFilePaths.should.eql(expectedFilePaths);
		});
	});
});
