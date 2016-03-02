import fileSystem from "fs";

describe("handler(event, context)", () => {
	it("should instantiate and invoke the akiroBuilder", () => {
		const expectedHandler = fileSystem.readFileSync(__dirname + "/../../fixtures/handler.js");
		const actualHandler = fileSystem.readFileSync(__dirname + "/../../../lib/akiro/builders/nodejs/handler.js");
		actualHandler.should.eql(expectedHandler);
	});
});
