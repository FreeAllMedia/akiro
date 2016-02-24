/* eslint-disable no-console */

import Akiro from "./akiro.js";

const akiro = new Akiro({
	region: "us-east-1",
	bucket: "fam-akiro"
});

// const iamRoleName = "AWSLambda";
// console.log("Deploying Akiro.");
// akiro.initialize(iamRoleName, error => {
// 	if (error) { throw error; }
// 	console.log("Akiro deploy1ed.");
// });

import packageJson from "../../package.json";

const outputDirectory = `${process.cwd()}/testOutput/`;

delete packageJson.dependencies.npm;

akiro.package({
	"flowsync": "0.1.12"
}, outputDirectory, (packageError) => {
	if (packageError) { throw packageError; }
	console.log("Akiro done.");
});
