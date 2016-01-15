import AkiroPackager from "../../../lib/akiro/packagers/nodejs/akiroPackager.js";
import sinon from "sinon";
import temp from "temp";
import fileSystem from "fs-extra";
import { exec } from "child_process";
import packageJson from "../../../../package.json";
import unzip from "unzip2";
import glob from "glob";
import difference from "array-difference";
import AWS from "aws-sdk";

temp.track();

describe("AkiroPackager(event, context)", () => {
	let event,
			context,
			akiroPackager,
			results,

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

	// afterEach(done => {
	// 	temp.cleanup(done);
	// });

	beforeEach(function (done) {
		this.timeout(60000);

		event = {
			region: "us-east-1",
			packages: {
				"async": packageJson.dependencies.async
			}
		};

		mockExec = sinon.spy((command, callback) => {
			const nodeCliPath = `${temporaryDirectoryPath}/node_modules/npm/bin/npm-cli.js`;
			switch(command) {
				case `cd ${temporaryDirectoryPath};node ${nodeCliPath} init -y`:
					const newPackageJson = require(`${__dirname}/../../fixtures/newPackage.json`);
					fileSystem.writeFile(`${temporaryDirectoryPath}/package.json`, JSON.stringify(newPackageJson), (error) => {
						callback(error);
					});
					break;
				case `cd ${temporaryDirectoryPath};node ${nodeCliPath} install`:
					fileSystem.copy(`${nodeModulesDirectoryPath}/async`, `${temporaryDirectoryPath}/node_modules/async`, (error) => {
						callback(error);
					});
					break;
				default:
					callback(new Error(`exec called with '${command}', but it is not mocked.`));
			}
		});

		nodeModulesDirectoryPath = `${__dirname}/../../../../node_modules`;

		mockNpmPath = `${nodeModulesDirectoryPath}/npm`;

		mockTemp = {
			mkdir: sinon.spy((directoryName, callback) => {
				callback(null, temporaryDirectoryPath);
			})
		};

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
			succeed: (succeedResults) => {
				results = succeedResults;
				done();
			},
			fail: (error) => {
				done(error);
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

	describe("akiroPackager.exec", () => {
		it("should be set to context.exec if provided", () => {
			akiroPackager.exec.should.eql(mockExec);
		});

		it("should be set to the exec package if not provided", () => {
			context = {};
			akiroPackager = new AkiroPackager(event, context);
			akiroPackager.exec.should.eql(exec);
		});
	});

	describe("akiroPackager.AWS", () => {
		it("should be set to context.AWS if provided", () => {
			akiroPackager.AWS.should.eql(MockAWS);
		});

		it("should be set to the AWS package if not provided", () => {
			context = {};
			akiroPackager = new AkiroPackager(event, context);
			akiroPackager.AWS.should.eql(AWS);
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
		const expectedNpmFileNames = fileSystem.readdirSync(`${nodeModulesDirectoryPath}/npm`);

		npmFileNames.should.have.members(expectedNpmFileNames);
	});

	it("should create an empty package.json to satisfy npm", () => {
		fileSystem.existsSync(`${temporaryDirectoryPath}/package.json`).should.be.true;
	});

	it("should add the designated packages as dependencies in the new package.json", () => {
		const newPackageJson = require(`${temporaryDirectoryPath}/package.json`);
		newPackageJson.dependencies.should.eql(event.packages);
	});

	it("should use npm to install and build all designated packages", () => {
		const asyncFileNames = fileSystem.readdirSync(`${temporaryDirectoryPath}/node_modules/async`);
		const expectedAsyncFileNames = fileSystem.readdirSync(`${nodeModulesDirectoryPath}/async`);

		asyncFileNames.should.have.members(expectedAsyncFileNames);
	});

	it("should add all designated package code to a .zip file", function (done) {
		/* eslint-disable new-cap */
		this.timeout(60000);

		const zipFilePath = `${temporaryDirectoryPath}/packages.zip`;

		let asyncFilePaths = glob.sync(`${temporaryDirectoryPath}/node_modules/async/**/*`, { dot: true });
		let npmFilePaths = glob.sync(`${temporaryDirectoryPath}/node_modules/npm/**/*`, { dot: true });

		asyncFilePaths = asyncFilePaths.filter(filterDirectories);
		npmFilePaths = npmFilePaths.filter(filterDirectories);

		function filterDirectories(filePath) {
			return !fileSystem.statSync(filePath).isDirectory();
		}

		let expectedFilePaths = asyncFilePaths.concat(npmFilePaths);
		expectedFilePaths = expectedFilePaths.map((filePath) => {
			const relativePath = filePath.replace(`${temporaryDirectoryPath}/node_modules/`, "");
			return relativePath;
		});

		let filePaths = [];
		fileSystem.createReadStream(zipFilePath)
			.pipe(unzip.Parse())
			.on("entry", (entry) => {
				filePaths.push(entry.path);
			})
			.on("close", () => {
				difference(expectedFilePaths, filePaths).should.eql([]);
				done();
			});
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
