"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.handler = handler;
function handler(event, context) {
	var LambdaClass = require("./" + context.functionName + ".js").default;
	var lambda = new LambdaClass(event, context);
	lambda.invoke(event, context);
}