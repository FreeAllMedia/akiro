export function handler(event, context) {
	const LambdaClass = require(`./akiroBuilder.js`).default;
	const lambda = new LambdaClass(event, context);
	lambda.invoke(event, context);
}
