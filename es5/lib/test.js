"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var cat = Symbol();

var something = _defineProperty({}, cat, "foo");

console.log(something["cat"]);
console.log(something[cat]);

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