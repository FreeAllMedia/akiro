import Akiro from "../../lib/akiro.js";
import temp from "temp";
import sinon from "sinon";
import Async from "flowsync";

temp.track();

describe("akiro.package(packageDetails, [outputDirectoryPath], callback)", () => {
	let config,
			akiro,
			callback,

			packageDetails,

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
			"incognito": "1.0.0"
		};

		outputDirectoryPath = temp.mkdirSync("akiro.package");

		lambdaConstructorSpy = sinon.spy();
		s3ConstructorSpy = sinon.spy();

		mockAsync = {
			parallel: sinon.spy(Async.parallel)
		};

		mockLambda = {
			invoke: sinon.spy((parameters, invokeCallback) => {
				invokeCallback();
			})
		};

		mockS3 = {
			putObject: sinon.spy((parameters, putObjectCallback) => {
				putObjectCallback();
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
			Async: mockAsync
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
		describe("(When outputDirectoryPath is provided)", () => {
			it("should copy the unzipped package files to the outputDirectoryPath provided");
		});
	});

	describe("(When a local cached version is available)", () => {

	});
});
