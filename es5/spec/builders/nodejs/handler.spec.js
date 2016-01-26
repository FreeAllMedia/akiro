"use strict";

var _libAkiroBuildersNodejsHandlerJs = require("../../../lib/akiro/builders/nodejs/handler.js");

describe("handler(event, context)", function () {
	var event = undefined,
	    context = undefined,
	    results = undefined;

	before(function (done) {
		event = {
			"name": "Bob"
		};

		context = {
			functionName: "mockMyLambda",
			succeed: function succeed(succeedResults) {
				results = succeedResults;
				done();
			}
		};

		(0, _libAkiroBuildersNodejsHandlerJs.handler)(event, context);
	});

	it("should instantiate the lambda class with the event", function () {
		results.constructorEvent.should.equal(event);
	});

	it("should instantiate the lambda class with the context", function () {
		results.constructorContext.should.equal(context);
	});

	it("should call invoke on the lambda class instance with the event", function () {
		results.invokeEvent.should.equal(event);
	});

	it("should call invoke on the lambda class instance with the context", function () {
		results.invokeContext.should.equal(context);
	});
});