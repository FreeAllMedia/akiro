import sinon from "sinon";
import privateData from "incognito";

export default class MockComponent {
	constructor(...options) {
		this.components = {all: []};

		this.constructorSpy = sinon.spy();
		this.constructorSpy(...options);

		this.initialize(...options);
	}

	addComponent(methodName, ComponentConstructor) {
		this.components[methodName] = [];
		this[methodName] = sinon.spy((...options) => {
			const component = new ComponentConstructor(...options);
			this.components[methodName].push(component);
			this.components.all.push(component);
			return component;
		});
	}

	asyncMethod(methodName, callbackError, callbackData) {
		this[methodName] = sinon.spy((callback) => {
			callback(callbackError, callbackData);
		});
	}

	property(propertyName) {
		this[propertyName] = sinon.spy((newValue) => {
			if (newValue) {
				privateData(this)[propertyName] = newValue;
			} else {
				return privateData(this)[propertyName];
			}
		});
	}

	chainedMultipleValueProperty(methodName) {
		this[methodName] = sinon.spy((...newValues) => {
			if (newValues.length > 0) {
				privateData(this)[methodName] = newValues;
				return this;
			} else {
				return privateData(this)[methodName];
			}
		});
	}

	chainedMultipleValueAggregateProperty(methodName) {
		privateData(this)[methodName] = [];
		this[methodName] = sinon.spy((...newValues) => {
			if (newValues.length > 0) {
				privateData(this)[methodName].push(newValues);
				return this;
			} else {
				return privateData(this)[methodName];
			}
		});
	}

	chainedProperty(methodName) {
		this[methodName] = sinon.spy((newValue) => {
			if (newValue) {
				privateData(this)[methodName] = newValue;
				return this;
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
