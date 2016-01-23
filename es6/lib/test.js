/* eslint-disable no-console */

import packageJson from "../../package.json";

import Akiro from "./akiro.js";

const akiro = new Akiro();

const iamRoleName = "AWSLambda";

akiro.initialize(iamRoleName, (error) => {
	if (error) { throw error; }
	console.log("Akiro deployed.");

	const outputDirectory = `${__dirname}/../../testOutput/`;

	akiro.package(packageJson.dependencies, outputDirectory, (packageError) => {
		if (packageError) { throw packageError; }
		console.log("Akiro deployed.");
	});
});
