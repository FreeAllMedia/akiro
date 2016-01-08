"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _sinon = require("sinon");

var _sinon2 = _interopRequireDefault(_sinon);

exports["default"] = MockAWS;
var s3Spy = _sinon2["default"].spy();
exports.s3Spy = s3Spy;
var lambdaSpy = _sinon2["default"].spy();

exports.lambdaSpy = lambdaSpy;
var mockS3 = {};
exports.mockS3 = mockS3;

var MockS3 = function MockS3(config) {
	_classCallCheck(this, MockS3);

	s3Spy(config);
	return mockS3;
};

var mockLambda = {};
exports.mockLambda = mockLambda;

var MockLambda = function MockLambda(config) {
	_classCallCheck(this, MockLambda);

	lambdaSpy(config);
	return mockLambda;
};

var MockAWS = {
	S3: MockS3,
	Lambda: MockLambda
};