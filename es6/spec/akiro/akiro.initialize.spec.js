import Akiro from "../../lib/akiro.js";
import { ConanAwsLambdaPlugin } from "conan";
import MockConan from "../helpers/mockConan.js";
import path from "path";
import temp from "temp";
import sinon from "sinon";
import fileSystem from "fs-extra";
import createMockExec from "../helpers/mockExec.js";
import glob from "glob";
import Async from "flowsync";

temp.track();

describe("akiro.initialize(iamRoleName, callback)", () => {
	let config,
			akiro,
			callback,

			lambdaName,
			lambdaRole,
			lambdaFilePath,
			handlerFilePath,
			temporaryDirectoryPath,

			mockConan,
			mockConanLambda,
			mockTemp,
			mockExec;

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
		lambdaName = "AkiroBuilder";
		lambdaRole = "AkiroLambda";

		const rootPath = path.normalize(`${__dirname}/../../../`);

		lambdaFilePath = `${rootPath}es6/lib/akiro/builders/nodejs/akiroBuilder.js`;
		const npmPath = `${rootPath}node_modules/npm/bin/npm-cli.js`;

		const nodeModulesDirectoryPath = `${rootPath}/node_modules`;

		mockExec = createMockExec({
			[`cd ${temporaryDirectoryPath};node ${npmPath} install`]: (commandDone) => {
				Async.series([
					(copyDone) => {
						fileSystem.copy(`${nodeModulesDirectoryPath}/async`, `${temporaryDirectoryPath}/node_modules/async`, (error) => {
							copyDone(error);
						});
					},
					(copyDone) => {
						fileSystem.copy(`${nodeModulesDirectoryPath}/incognito`, `${temporaryDirectoryPath}/node_modules/incognito`, (error) => {
							copyDone(error);
						});
					}
				], commandDone);
			},

			[`cd ${temporaryDirectoryPath};node ${npmPath} init -y`]: execDone => {
				fileSystem.copySync(`${__dirname}/../fixtures/newPackage.json`, `${temporaryDirectoryPath}/package.json`);
				execDone();
			},

			["npm info .*"]: execDone => {
				execDone(null, "1.5.0");
			}
		});

		mockTemp = {
			mkdir: sinon.spy((directoryName, mkdirCallback) => {
				mkdirCallback(null, temporaryDirectoryPath);
			})
		};

		config = {
			exec: mockExec,
			conan: mockConan = new MockConan(),
			temp: mockTemp
		};

		akiro = new Akiro(config);

		callback = done;
		akiro.initialize(lambdaRole, callback);
	});

	it("should use the ConanAwsLambdaPlugin", () => {
		mockConan.use.calledWith(ConanAwsLambdaPlugin).should.be.true;
	});

	describe("Akiro Lambda", () => {
		beforeEach(() => {
			mockConanLambda = mockConan.components.lambda;
		});

		it("should use the correct name", () => {
			mockConanLambda.name.calledWith(lambdaName).should.be.true;
		});

		it("should use the 'nodejs' runtime", () => {
			mockConanLambda.runtime.firstCall.args[0].should.eql("nodejs");
		});

		it("should use the supplied handlerFilePath", () => {
			mockConanLambda.filePath.firstCall.args[0].should.eql(lambdaFilePath);
		});

		it("should use change the handler to 'invoke'", () => {
			mockConanLambda.handler.firstCall.args[0].should.eql("invoke");
		});

		it("should use the supplied role", () => {
			mockConanLambda.role.firstCall.args[0].should.eql(lambdaRole);
		});

		it("should build its own dependencies in a temp directory", () => {
			const dependencyFileNames = glob.sync(`${temporaryDirectoryPath}/**/*`).map((dependencyPath) => {
				return dependencyPath.replace(`${temporaryDirectoryPath}/`, "");
			});

			dependencyFileNames.should.contain.members([
				"node_modules/async",
				"node_modules/incognito"
			]);
		});

		it("should include akiroBuilder and dependencies in the temp directory", () => {
			let dependencyPaths = [
				[`${temporaryDirectoryPath}/node_modules/**/*`, "/node_modules"]
			];

			mockConanLambda.dependencies().should.eql(dependencyPaths);
		});

		it("should be deployed to AWS", () => {
			mockConan.deploy.calledWith(callback).should.be.true;
		});
	});
});
