import ChainLink from "mrt";
import sinon from "sinon";

export default class MockConan extends ChainLink {
	initialize() {
		this
			.link("lambda", MockConanLambda)
				.into("lambdas");

		this.use = sinon.spy();
	}

	deploy(callback) {
		callback();
	}
}

class MockConanLambda extends ChainLink {
	initialize(name) {
		this.parameters(
			"name",
			"filePath",
			"handler",
			"runtime",
			"role",
			"description",
			"memorySize",
			"timeout",
			"publish",
			"bucket",
			"packages"
		);

		this.parameters(
			"dependencies"
		).multiValue.aggregate;

		this.name(name);
		this.runtime("nodejs");
	}
}
