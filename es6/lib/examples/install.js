/* eslint-disable no-console */

import Akiro from "../akiro.js";
const akiro = new Akiro();


console.log("Akiro deploying...");
akiro
	.debug
	.region("us-east-1")
	.bucket("fam-akiro")
	.roleName("AWSLambda")
	.install(error => {
		if (error) { throw error; }
		console.log("Akiro deployed.");
	});
