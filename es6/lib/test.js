import Akiro from "./akiro.js";

const akiro = new Akiro();

akiro.initialize("AWSLambda", (error) => {
	if (error) { throw error; }
	console.log("Akiro deployed.");
});
