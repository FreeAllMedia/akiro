import Akiro from "../../lib/akiro.js";
import { ConanAwsLambdaPlugin } from "conan";
import MockConan from "../helpers/mockConan.js";
import path from "path";
import { dependencies } from "../../../package.json";

describe("akiro.initialize(iamRoleName, callback)", () => {
	let config,
			akiro,
			callback,

			lambdaName,
			lambdaRole,
			lambdaFilePath,

			mockConan,
			mockConanLambda;

	beforeEach(done => {
		lambdaName = "Akiro";
		lambdaRole = "AkiroLambda";
		lambdaFilePath = path.normalize(__dirname + "../../../lib/akiro/packagers/akiro.packager.nodejs.js");

		config = {
			conan: mockConan = new MockConan()
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

		it("should use the supplied lambdaFilePath", () => {
			mockConanLambda.filePath.firstCall.args[0].should.eql(lambdaFilePath);
		});

		it("should use the supplied role", () => {
			mockConanLambda.role.firstCall.args[0].should.eql(lambdaRole);
		});

		it("should include all dependencies", () => {
			let dependencyPaths = [];

			for(let dependencyName in dependencies) {
				const dependencyPath = path.normalize(__dirname + "../../../../node_modules");
				dependencyPaths.push(`${dependencyPath}/${dependencyName}/**/{*.*,.*}`);
			}

			mockConanLambda.dependencies.firstCall.args[0].should.eql(dependencyPaths);
		});

		it("should be deployed to AWS", () => {
			mockConan.deploy.calledWith(callback).should.be.true;
		});
	});
});
