import MockComponent from "./mockComponent.js";

export default class MockConan extends MockComponent {
	initialize() {
		this.property("use");
		this.addComponent("lambda", MockConanLambda);
		this.asyncMethod("deploy");
	}
}

class MockConanLambda extends MockComponent {
	initialize(name) {
		this.chainedProperties(
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

		this.chainedMultipleValueAggregateProperty(
			"dependencies"
		);

		this.addComponent("lambda", MockConanLambda);

		this.name(name);
		this.runtime("nodejs");
	}
}
