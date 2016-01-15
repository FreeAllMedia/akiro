"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports["default"] = handler;

function handler(event, context) {
	var LambdaClass = require("./" + context.functionName + ".js");
	var lambda = new LambdaClass(context, event);
	lambda.invoke(event, context);
}

module.exports = exports["default"];