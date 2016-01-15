import Akiro from "../../lib/akiro.js";
import { ConanAwsLambdaPlugin } from "conan";
import MockConan from "../helpers/mockConan.js";
import path from "path";
import { packagerDependencies } from "../../../package.json";

describe("akiro.initialize(iamRoleName, callback)", () => {
	let config,
			akiro,
			callback,

			lambdaName,
			lambdaRole,
			lambdaFilePath,
			handlerFilePath,

			mockConan,
			mockConanLambda;

	beforeEach(done => {
		lambdaName = "akiroPackager";
		lambdaRole = "AkiroLambda";
		lambdaFilePath = path.normalize(__dirname + "../../../lib/akiro/packagers/nodejs/akiroPackager.js");
		handlerFilePath = path.normalize(__dirname + "../../../lib/akiro/packagers/nodejs/handler.js");

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

		it("should use the supplied handlerFilePath", () => {
			mockConanLambda.filePath.firstCall.args[0].should.eql(handlerFilePath);
		});

		it("should use the supplied role", () => {
			mockConanLambda.role.firstCall.args[0].should.eql(lambdaRole);
		});

		it("should include akiroPackager and dependencies", () => {
			let dependencyPaths = [
				lambdaFilePath
			];

			for(let dependencyName in packagerDependencies) {
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
