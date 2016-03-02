/* eslint-disable no-console */

import fileSystem from "fs";

import Akiro from "../akiro.js";
const akiro = new Akiro({
	region: "us-east-1",
	bucket: "fam-akiro",
	debug: 1
});

const iamRoleName = "AWSLambda";
console.log("Deploying Akiro.");
akiro.initialize(iamRoleName, error => {
	if (error) { throw error; }
	console.log("Akiro deployed.");
});
