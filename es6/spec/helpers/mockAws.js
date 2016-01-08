import sinon from "sinon";

class MockS3 {
	constructor(config) {
		s3Spy(config);
		return s3;
	}
}

class MockLambda {
	constructor(config) {
		lambdaSpy(config);
		return lambda;
	}
}

const MockAWS = {
	S3: MockS3,
	Lambda: MockLambda,
	values: {},
	reset: resetValues
};

function resetValues() {
	this.values = {};
}

export { MockAWS as default };

export const s3Spy = sinon.spy();
export const lambdaSpy = sinon.spy();

export const s3 = {};
export const lambda = {};
