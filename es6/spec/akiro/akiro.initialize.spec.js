import Akiro from "../../lib/akiro.js";
import { ConanAwsLambdaPlugin } from "conan";
import MockConan from "../helpers/mockConan.js";
import path from "path";
import { builderDependencies } from "../../../package.json";
import temp from "temp";
import sinon from "sinon";
import fileSystem from "fs-extra";
import createMockExec from "../helpers/mockExec.js";

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
		this.timeout(300000);

		lambdaName = "akiroBuilder";
		lambdaRole = "AkiroLambda";

		const rootPath = path.normalize(`${__dirname}/../../../`);

		lambdaFilePath = `${rootPath}es6/lib/akiro/builders/nodejs/akiroBuilder.js`;
		handlerFilePath = `${rootPath}es6/lib/akiro/builders/nodejs/handler.js`;
		const npmPath = `${rootPath}node_modules/npm/bin/npm-cli.js`;

		mockExec = createMockExec({
			[`cd ${temporaryDirectoryPath};node ${npmPath} install`]: execDone => execDone(),
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
			}),
			track: () => {}
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
			mockConanLambda.filePath.firstCall.args[0].should.eql(handlerFilePath);
		});

		it("should use the supplied role", () => {
			mockConanLambda.role.firstCall.args[0].should.eql(lambdaRole);
		});

		xit("should use AkiroBuilder to build its own dependencies in a temp directory", () => {
			const dependencyFileNames = fileSystem.readdirSync(temporaryDirectoryPath);

			dependencyFileNames.should.eql([
				1, 2, 3
			]);
		});

		it("should include akiroBuilder and dependencies", () => {
			let dependencyPaths = [
				[lambdaFilePath]
			];

			for(let dependencyName in builderDependencies) {
				dependencyPaths.push([`${temporaryDirectoryPath}/node_modules/${dependencyName}/**/*`]);
			}

			mockConanLambda.dependencies().should.eql(dependencyPaths);
		});

		it("should be deployed to AWS", () => {
			mockConan.deploy.calledWith(callback).should.be.true;
		});
	});
});
