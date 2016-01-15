/* eslint-disable no-console */

import Akiro from "./akiro.js";

const akiro = new Akiro();

const iamRoleName = "AWSLambda";

akiro.initialize(iamRoleName, (error) => {
	if (error) { throw error; }
	console.log("Akiro deployed.");
});
