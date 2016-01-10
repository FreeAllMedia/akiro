import sinon from "sinon";
import privateData from "incognito";

export default class MockComponent {
	constructor(...options) {
		this.components = {};

		this.constructorSpy = sinon.spy();
		this.constructorSpy(...options);

		this.initialize(...options);
	}

	component(methodName, ComponentConstructor) {
		this[methodName] = sinon.spy((...options) => {
			this.components[methodName] = new ComponentConstructor(...options);
			return this.components[methodName];
		});
	}

	asyncMethod(methodName, callbackError, callbackData) {
		this[methodName] = sinon.spy((callback) => {
			callback(callbackError, callbackData);
		});
	}

	chainedProperty(methodName) {
		this[methodName] = sinon.spy((newValue) => {
			if (newValue) {
				privateData(this)[methodName] = newValue;
			} else {
				return privateData(this)[methodName];
			}
		});
	}

	chainedProperties(...methodNames) {
		methodNames.forEach(this.chainedProperty, this);
	}

	initialize() {}

	static reset() {
		this.constructor.instance = undefined;
	}
}
