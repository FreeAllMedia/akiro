import Akiro from "../../lib/akiro.js";
import temp from "temp";
import sinon from "sinon";
import Async from "flowsync";
import glob from "glob";
import fileSystem from "fs-extra";
import path from "path";

// temp.track();

describe("akiro.package(packageDetails, outputDirectoryPath, callback)", () => {
	let config,
			akiro,
			callback,

			packageDetails,

			cacheDirectoryPath,
			outputDirectoryPath,

			mockAsync,
			mockAWS,
			mockS3,
			mockLambda,

			lambdaConstructorSpy,
			s3ConstructorSpy;

	beforeEach(function (done) {
		packageDetails = {
			"async": "1.0.0",
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
					fileName: `${packageName}-${packageVersion}.zip`
				});
			})
		};

		const mockS3GetObjectAsyncRequest = {
			createReadStream: () => {
				return fileSystem.createReadStream(`${__dirname}/../fixtures/async-1.0.0.zip`);
			}
		};

		const mockS3GetObjectIncognitoRequest = {
			createReadStream: () => {
				return fileSystem.createReadStream(`${__dirname}/../fixtures/incognito-0.1.4.zip`);
			}
		};

		mockS3 = {
			getObject: sinon.spy((parameters) => {
				switch (parameters.Key) {
					case "async-1.0.0.zip":
						return mockS3GetObjectAsyncRequest;
					case "incognito-0.1.4.zip":
						return mockS3GetObjectIncognitoRequest;
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

		callback = done;
		akiro.package(packageDetails, outputDirectoryPath, callback);
	});

	it("should instantiate Lambda with the designated region", () => {
		lambdaConstructorSpy.calledWith({
			region: config.region
		}).should.be.true;
	});

	it("should instantiate S3 with the designated region", () => {
		s3ConstructorSpy.calledWith({
			region: config.region
		}).should.be.true;
	});

	describe("(Lambda Invoking)", () => {
		it("should invoke the Akiro Builder lambda functions in parallel", () => {
			mockAsync.parallel.called.should.be.true;
		});

		it("should invoke the Akiro Builder lambda function on AWS for each dependency (mock One)", () => {
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
			mockLambda.invoke.firstCall.args[0].should.eql(expectedParameters);
		});

		it("should invoke the Akiro Builder lambda function on AWS for each dependency (mock Two)", () => {
			const expectedParameters = {
				FunctionName: "AkiroBuilder", /* required */
				Payload: JSON.stringify({
					bucket: config.bucket,
					region: config.region,
					package: {
						name: "incognito",
						version: packageDetails.incognito
					}
				})
			};
			mockLambda.invoke.secondCall.args[0].should.eql(expectedParameters);
		});
	});

	describe("(When an Akiro Builder Lambda invoke fails)", () => {
		let error;

		beforeEach(done => {
			mockLambda.invoke = (parameters, invokeCallback) => {
				invokeCallback(new Error());
			};

			akiro.package(packageDetails, outputDirectoryPath, (packageError) => {
				error = packageError;
				done();
			});
		});

		it("should return the error", () => {
			error.should.be.instanceOf(Error);
		});
	});

	describe("(When a local cached version is not available)", () => {
		it("should download each zipped package file in parallel", () => {
			mockAsync.parallel.calledTwice.should.be.true;
		});

		describe("(Mock Package One)", () => {
			let fileName;

			beforeEach(() => {
				fileName = "async-1.0.0.zip";
			});

			it("should call S3 for the correct package zip file", () => {
				const expectedParameters = {
					Bucket: config.bucket,
					Key: fileName
				};

				mockS3.getObject.calledWith(expectedParameters).should.be.true;
			});

			it("should download each zipped package files to the akiro cache directory", () => {
				fileSystem.existsSync(`${cacheDirectoryPath}/${fileName}`).should.be.true;
			});
		});

		describe("(Mock Package Two)", () => {
			let fileName;

			beforeEach(() => {
				fileName = "incognito-0.1.4.zip";
			});

			it("should call S3 for the correct package zip file", () => {
				const expectedParameters = {
					Bucket: config.bucket,
					Key: fileName
				};

				mockS3.getObject.calledWith(expectedParameters).should.be.true;
			});

			it("should download each zipped package files to the akiro cache directory", () => {
				fileSystem.existsSync(`${cacheDirectoryPath}/${fileName}`).should.be.true;
			});
		});


		it("should unzip each package file in parallel", () => {
			mockAsync.parallel.calledThrice.should.be.true;
		});

		it("should copy the unzipped package files to the outputDirectoryPath provided", () => {
			const outputDirectoryFilePaths = glob.sync(outputDirectoryPath).map((filePath) => {
				return filePath.replace(outputDirectoryPath, "");
			});

			const fixturesOutputDirectoryPath = path.normalize(`${__dirname}/../fixtures/output`);
			const expectedFilePaths = glob.sync(`${fixturesOutputDirectoryPath}/**/*`, { dot: true }).map((filePath) => {
				return filePath.replace(fixturesOutputDirectoryPath, "");
			});

			outputDirectoryFilePaths.should.eql(expectedFilePaths);
		});
	});

	describe("(When a local cached version is available)", () => {
		it("should copy the package files to the output directory from the cached .zip files");
	});
});
