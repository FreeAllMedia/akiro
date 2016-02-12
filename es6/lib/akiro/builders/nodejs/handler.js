export function handler(event, context) {
	const LambdaClass = require(`./${context.functionName}.js`).default;
	const lambda = new LambdaClass(event, context);
	lambda.invoke(event, context);
}
