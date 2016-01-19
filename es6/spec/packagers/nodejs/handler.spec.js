import { handler } from "../../../lib/akiro/builders/nodejs/handler.js";

describe("handler(event, context)", () => {
	let event,
			context,
			results;

	before(done => {
		event = {
			"name": "Bob"
		};

		context = {
			functionName: "mockMyLambda",
			succeed: (succeedResults) => {
				results = succeedResults;
				done();
			}
		};

		handler(event, context);
	});

	it("should instantiate the lambda class with the event", () => {
		results.constructorEvent.should.equal(event);
	});

	it("should instantiate the lambda class with the context", () => {
		results.constructorContext.should.equal(context);
	});

	it("should call invoke on the lambda class instance with the event", () => {
		results.invokeEvent.should.equal(event);
	});

	it("should call invoke on the lambda class instance with the context", () => {
		results.invokeContext.should.equal(context);
	});
});
