import Akiro from "../../lib/akiro/akiro.js";
import path from "path";

describe("akiro.lambda", () => {
	let lambda,
			role,
			runtime;

	beforeEach(() => {
		role = "MyIAmRole";
		runtime = "nodejs";

		const akiro = new Akiro({
			role: role,
			runtime: runtime
		});

		lambda = akiro.lambda;
	});

	it("should use the correct name", () => {
		lambda.name().should.eql("AkiroBuilder");
	});

	it("should use the 'nodejs' runtime", () => {
		lambda.runtime().should.eql(runtime);
	});

	it("should use the supplied handlerFilePath", () => {
		const filePath = path.normalize(`${__dirname}/../../lib/builders/nodejs/handler.js`);
		lambda.filePath().should.eql(filePath);
	});

	it("should set the timeout to 300 seconds", () => {
		lambda.timeout().should.eql(300);
	});

	it("should use the supplied role", () => {
		lambda.role().should.eql(role);
	});
});
