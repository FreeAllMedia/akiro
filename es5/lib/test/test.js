"use strict";

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _sinon = require("sinon");

var _sinon2 = _interopRequireDefault(_sinon);

var _awsSdk = require("aws-sdk");

var _awsSdk2 = _interopRequireDefault(_awsSdk);

var MockLambda = function MockLambda() {
	_classCallCheck(this, MockLambda);

	return _sinon2["default"].createStubInstance(_awsSdk2["default"].Lambda);
};

var MockAWS = {
	Lambda: MockLambda
};

var lambda = new MockAWS.Lambda();

lambda.invoke({ something: "blah" }, function () {
	console.log(lambda.called);
});