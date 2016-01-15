export default class MyLambda {
	constructor(event, context) {
		this.constructorEvent = event;
		this.constructorContext = context;
	}
	invoke(event, context) {
		this.invokeEvent = event;
		this.invokeContext = context;

		context.succeed({
			constructorEvent: this.constructorEvent,
			constructorContext: this.constructorContext,
			invokeEvent: this.invokeEvent,
			invokeContext: this.invokeContext
		});
	}
}
