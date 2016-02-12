/* eslint-disable no-console */

//import Akiro from "./akiro.js";

// const akiro = new Akiro({
// 	region: "us-east-1",
// 	bucket: "akiro.test"
// });
//
// const iamRoleName = "AWSLambda";
//
// console.log("Deploying Akiro.");
// akiro.initialize(iamRoleName, (error) => {
// 	if (error) { throw error; }
// 	console.log("Akiro deployed.");
// });

// const outputDirectory = `${__dirname}/../../testOutput/`;
//
// akiro.package(packageJson.dependencies, outputDirectory, (packageError) => {
// 	if (packageError) { throw packageError; }
// 	console.log("Akiro deployed.");
// });

import Conan from "conan";

const conan = new Conan({
	region: "us-east-1",
	
});
