import MockComponent from "./mockComponent.js";

export default class MockConan extends MockComponent {
	initialize() {
		this.property("use");
		this.component("lambda", MockConanLambda);
		this.asyncMethod("deploy");
	}
}

class MockConanLambda extends MockComponent {
	initialize(name, filePath, role) {
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
			"packages",
			"dependencies"
		);

		this.component("lambda", MockConanLambda);

		this.name(name);
		this.filePath(filePath);
		this.role(role);
		this.runtime("nodejs");
	}
}
