/* eslint-disable no-console */

import fileSystem from "fs";

import Akiro from "../akiro.js";
const akiro = new Akiro();

const packages = {
	"flowsync": "^0.1.12",
	"almaden": "^0.3.1",
	"dovima": "^0.3.2",
	"incognito": "^0.1.4"
};

const outputDirectory = `${process.cwd()}/testOutput/`;

console.log("Building packages!");

akiro
	.debug
	.region("us-east-1")
	.bucket("fam-akiro")
	.packages(packages)
		.package("ffmpeg")
			.runScript("")
			.includeBinaries("ffmpeg", "mp32wav") // which ffmpeg
				.basePath("/blah/")
				.zipPath("somedir/")
			.includeFiles("/home/akiro/something/**/*", "/home/somethingElse/**/*")
				.basePath("something")
				.zipPath("somethingElse")
	.outputDirectory(outputDirectory)
	.build(packageError => {
		if (packageError) { throw packageError; }
		console.log("Voila!", fileSystem.readdirSync(outputDirectory));
	});
