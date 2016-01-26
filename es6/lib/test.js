const oldWrite = process.stdout.write;
process.stdout.write = function () {};

var npm = require("npm");
npm.load({ loglevel: "silent"}, function(err) {
  // install module ffi
  npm.commands.info(["async@1.1.x"], function(er, data) {
		process.stdout.write = oldWrite;
		if (er) { throw er; }
		const versionNumbers = Object.keys(data);
		const latestVersion = versionNumbers[versionNumbers.length-1];
		console.log(latestVersion);
    // log errors or data
  });
});





// /* eslint-disable no-console */
//
// import packageJson from "../../package.json";
//
// import Akiro from "./akiro.js";
//
// const akiro = new Akiro();
//
// const iamRoleName = "AWSLambda";
//
// akiro.initialize(iamRoleName, (error) => {
// 	if (error) { throw error; }
// 	console.log("Akiro deployed.");
//
// 	const outputDirectory = `${__dirname}/../../testOutput/`;
//
// 	akiro.package(packageJson.dependencies, outputDirectory, (packageError) => {
// 		if (packageError) { throw packageError; }
// 		console.log("Akiro deployed.");
// 	});
// });
