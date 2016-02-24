"use strict";

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe("handler(event, context)", function () {
	it("should instantiate and invoke the akiroBuilder", function () {
		var expectedHandler = _fs2.default.readFileSync(__dirname + "/../../fixtures/handler.js");
		var actualHandler = _fs2.default.readFileSync(__dirname + "/../../../lib/akiro/builders/nodejs/handler.js");
		actualHandler.should.eql(expectedHandler);
	});
});