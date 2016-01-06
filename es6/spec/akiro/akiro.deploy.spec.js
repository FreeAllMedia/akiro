import Akiro from "../../lib/akiro.js";
import sinon from "sinon";

describe("akiro.deploy(callback)", () => {
	let akiro,
			callback,
			awsLambda;

	beforeEach(() => {
		awsLambda = {
			createFunction: sinon.spy((parameters, callback) => {
				callback();
			})
		};

		akiro = new Akiro({
			branch: "someBranch",
			awsLambda: awsLambda
		});
	});

	describe("(Akiro Lambda Zip File)", () => {
		it("should contain the Akiro packager lambda");
		it("should contain all Akiro packager dependencies");
	});

	it("should create an Akiro lambda function on AWS");
});
