import Akiro from "../../../lib/akiro.js";
import temp from "temp";
import sinon from "sinon";
import Async from "flowsync";
import fileSystem from "fs-extra";
import path from "path";

temp.track();

describe("akiro.package(packageDetails, outputDirectoryPath, callback)", () => {
	let config,
			akiro,
			error,

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

		outputDirectoryPath = path.normalize(`${__dirname}/../../../../temp`); //temp.mkdirSync("akiro.output");
		cacheDirectoryPath = `${temp.mkdirSync("akiro.cache")}`;

		lambdaConstructorSpy = sinon.spy();
		s3ConstructorSpy = sinon.spy();

		mockAsync = {
			parallel: sinon.spy(Async.parallel)
		};

		mockLambda = {
			invoke: sinon.spy((parameters, invokeCallback) => {
				invokeCallback(new Error());
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

		akiro = new Akiro(config);

		akiro.package(packageDetails, outputDirectoryPath, (packageError) => {
			error = packageError;
			done();
		});
	});

	afterEach((done) => {
		temp.cleanup(done);
	});

	describe("(When an Akiro Builder Lambda invoke fails)", () => {
		it("should return the error", () => {
			error.should.be.instanceOf(Error);
		});
	});

});
