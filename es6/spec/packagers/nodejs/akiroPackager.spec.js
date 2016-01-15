import AkiroPackager from "../../../lib/akiro/packagers/nodejs/akiroPackager.js";
import sinon from "sinon";
import temp from "temp";
import fileSystem from "fs";

temp.track();

describe("AkiroPackager(event, context)", () => {
	let event,
			context,
			akiroPackager,
			results,

			temporaryDirectoryPath,
			mockNpmPath,
			mockTemp;

	beforeEach(done => {
		temp.mkdir("akiroPackager", (error, newTemporaryDirectoryPath) => {
			temporaryDirectoryPath = newTemporaryDirectoryPath;
			done();
		});
	});

	// afterEach(done => {
	// 	temp.cleanup(done);
	// });

	beforeEach(done => {
		event = {};

		mockNpmPath = `${__dirname}/../../../../node_modules/npm`;

		mockTemp = {
			mkdir: sinon.spy((directoryName, callback) => {
				callback(null, temporaryDirectoryPath);
			})
		};

		context = {
			npmPath: mockNpmPath,
			temp: mockTemp,
			succeed: (succeedResults) => {
				results = succeedResults;
				done();
			}
		};

		akiroPackager = new AkiroPackager(event, context);
		akiroPackager.invoke(event, context);
	});

	describe("akiroPackager.temp", () => {
		it("should be set to context.temp if provided", () => {
			akiroPackager.temp.should.eql(mockTemp);
		});

		it("should be set to the temp package if not provided", () => {
			context = {};
			akiroPackager = new AkiroPackager(event, context);
			akiroPackager.temp.should.eql(temp);
		});
	});

	describe("akiroPackager.npmPath", () => {
		it("should be set to context.npmPath if provided", () => {
			akiroPackager.npmPath.should.eql(mockNpmPath);
		});

		it("should be set to the npmPath package if not provided", () => {
			context = {};
			akiroPackager = new AkiroPackager(event, context);
			akiroPackager.npmPath.should.eql("./node_modules/npm");
		});
	});

	describe("(Temporary Directory)", () => {
		it("should create a temporary 'akiroPackager' directory", () => {
			mockTemp.mkdir.firstCall.args[0].should.eql("akiroPackager");
		});

		it("should return any errors from creating the temporary directory", () => {
			const expectedError = new Error();

			context = {
				temp: mockTemp,
				fail: (failError) => {
					failError.should.eql(expectedError);
				}
			};

			mockTemp.mkdir = sinon.spy((directoryName, callback) => {
				callback(expectedError);
			});

			akiroPackager = new AkiroPackager(event, context);
			akiroPackager.invoke(event, context);
		});
	});

	it("should copy ./node_modules/npm to the temporary directory", () => {
		const npmFileNames = fileSystem.readdirSync(`${temporaryDirectoryPath}/node_modules/npm`);
		const expectedNpmFileNames = fileSystem.readdirSync(`${__dirname}/../../../../node_modules/npm`);

		npmFileNames.should.have.members(expectedNpmFileNames);
	});

	it("should create an empty package.json to satisfy npm");
	it("should use npm to install and build all designated packages");
	it("should add all designated package code to a .zip file");
	it("should copy the .zip file to the designated S3 bucket");
	it("should copy the .zip file to the designated S3 key");
});
