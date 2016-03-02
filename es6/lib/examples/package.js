/* eslint-disable no-console */

import fileSystem from "fs";

import Akiro from "../akiro.js";
const akiro = new Akiro({
	region: "us-east-1",
	bucket: "fam-akiro",
	debug: 1
});

const packages = {
	"flowsync": "^0.1.12",
	"almaden": "^0.3.1",
	"dovima": "^0.3.2",
	"incognito": "^0.1.4"
};

const outputDirectory = `${process.cwd()}/testOutput/`;

akiro.package(packages, outputDirectory, (packageError) => {
	if (packageError) { throw packageError; }
	console.log("Voila!", fileSystem.readdirSync(outputDirectory));
});
