![](./images/akiro-logo.png)

# Akiro.js [![npm version](https://img.shields.io/npm/v/akiro.svg)](https://www.npmjs.com/package/akiro) [![license type](https://img.shields.io/npm/l/akiro.svg)](https://github.com/FreeAllMedia/akiro.git/blob/master/LICENSE) ![ECMAScript 2015 Source](https://img.shields.io/badge/Source-ECMAScript%202015-brightgreen.svg) [![npm downloads](https://img.shields.io/npm/dm/akiro.svg)](https://www.npmjs.com/package/akiro) [![node 5.x.x](https://img.shields.io/badge/node-5.x.x-brightgreen.svg)](https://travis-ci.org/FreeAllMedia/akiro) [![node 4.x.x](https://img.shields.io/badge/node-4.x.x-brightgreen.svg)](https://travis-ci.org/FreeAllMedia/akiro) [![node 3.x.x](https://img.shields.io/badge/node-3.x.x-brightgreen.svg)](https://travis-ci.org/FreeAllMedia/akiro) [![iojs 2.x.x](https://img.shields.io/badge/iojs-2.x.x-brightgreen.svg)](https://travis-ci.org/FreeAllMedia/akiro) [![iojs 1.x.x](https://img.shields.io/badge/iojs-1.x.x-brightgreen.svg)](https://travis-ci.org/FreeAllMedia/akiro) [![node 0.12.x](https://img.shields.io/badge/node-0.12.x-brightgreen.svg)](https://travis-ci.org/FreeAllMedia/akiro) [![node 0.11.x](https://img.shields.io/badge/node-0.11.x-brightgreen.svg)](https://travis-ci.org/FreeAllMedia/akiro) [![node 0.10.x](https://img.shields.io/badge/node-0.10.x-brightgreen.svg)](https://travis-ci.org/FreeAllMedia/akiro) [![Build Status](https://travis-ci.org/FreeAllMedia/akiro.png?branch=master)](https://travis-ci.org/FreeAllMedia/akiro) [![Dependency Status](https://david-dm.org/FreeAllMedia/akiro.png?theme=shields.io)](https://david-dm.org/FreeAllMedia/akiro?theme=shields.io) [![Dev Dependency Status](https://david-dm.org/FreeAllMedia/akiro/dev-status.svg)](https://david-dm.org/FreeAllMedia/akiro?theme=shields.io#info=devDependencies) [![Coverage Status](https://coveralls.io/repos/FreeAllMedia/akiro/badge.svg)](https://coveralls.io/r/FreeAllMedia/akiro) [![Code Climate](https://codeclimate.com/github/FreeAllMedia/akiro/badges/gpa.svg)](https://codeclimate.com/github/FreeAllMedia/akiro)

When you get started with `AWS Lambda` functions, you may need to use an `npm package` that contains some static code (such as C++, C, or any other language that requires compiling). If you try to compile these packages on your development computer, then deploy that code to `AWS Lambda`, it will fail because the code wasn't compiled for the environment it was deployed to.

* `Akiro` solves this problem by deploying a single `AkiroBuilder` function to your `AWS Lambda` account which compiles `npm packages` for you indirectly on the architecture that the code is going to run on.
* Packages are built in parallel using multiple invokes of the same `AkiroBuilder Lambda` to minimize build time and prevent `AWS Lambda Function Timeout` (max 300 seconds).
* After the packages are built, they are automatically saved to an S3 bucket of your designation, then optionally downloaded and unzipped to a local directory.
* Built-in support for local caching so that any specific version of any package is only built once and then re-used to optimize deployment times. This greatly optimizes deployment speeds!

``` javascript
import Akiro from "akiro";
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

const outputDirectory = `${process.cwd()}/node_modules_aws/`;

akiro.package(packages, outputDirectory, (packageError) => {
	if (packageError) { throw packageError; }
	console.log("Voila!", `ls -lah ${outputDirectory}`);
});
```

# Getting Started

`Akiro` requires minimal initial configuration before its automation can take over. Please read through this entire guide before attempting to use `Akiro`. It may save you much grief!

## Installation

The easiest way to install Akiro is through the node package manager:

``` shell
npm install akiro --save-dev
```

## Configuration

There are *two* mandatory ways you must configure Akiro:

1. Setup your own AWS Credentials so that you can deploy an `AWS Lambda Function` to your account.
2. Setup an `AWS IAm Role` for the `AkiroBuilder Lambda Function` to save objects to `AWS S3`.
	* This is required because `AWS Lambdas` don't have a way to send back the compiled packages on their own.
	* Instead, `Akiro` saves the compiled packages to an `AWS S3 Bucket` of your choice so that `Akiro` can download them back to your computer.
3. Initialize `Akiro` to the `AWS Regions` you will use it on.

### 1. Setup Your Own `~/.aws/credentials`

* Akiro expects there to be an ~/.aws/credentials file.
* For more information on how to set up this file, [read this guide](http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html#Credentials_from_the_Shared_Credentials_File_____aws_credentials_).
* In the future, we will add support for specifying credentials manually in other ways.
	* Please submit an issue if you urgently require a different method.

### 2. Setup an AWS IAm Role For AkiroBuilder

Due to the size of this section, we've decided to put it onto its own page. Behold, it has pictures!

* [The Official Guide to Setting Up an AWS IAm Role For Akiro](./documentation/awsIamRoleSetup.md)

### 3. Initialize Akiro

* Initializing deploys an `AWS Lambda` called `AkiroBuilder` to an `AWS Region` of your choice.
* The `AkiroBuilder Lambda Function` is fundamental for the functionality of `Akiro`.
* Akiro only needs to be initialized **once per `AWS Region`** that your organization will deploy `AWS Lambdas` to:
* This process will be simplified in later BETA releases.

``` javascript
import Akiro from "akiro";
const akiro = new Akiro({
	region: "us-east-1",
	debug: 1
});

const iamRoleName = "AWSLambda";

akiro.initialize(iamRoleName, error => {
	if (error) { throw error; }
	console.log("Akiro deployed.");
});
```

# Building Packages

After `Akiro` is configured and initialized the `akiro.package()` method becomes available for everybody in the orignanization to build packages on the `AkiroBuilder`.

## akiro.package(packageList, outputDirectory, callback)

``` javascript
import Akiro from "akiro";
const akiro = new Akiro({
	region: "us-east-1", // Defaults to "us-east-1"
	bucket: "my-akiro-bucket", // Required
	debug: 1 // Comment out to run silent
});

const packages = {
	"flowsync": "^0.1.12",
	"almaden": "^0.3.1",
	"dovima": "^0.3.2",
	"incognito": "^0.1.4"
};

const outputDirectory = `${process.cwd()}/node_modules_aws/`;

akiro.package(packages, outputDirectory, (packageError) => {
	if (packageError) { throw packageError; }
	console.log("Voila!", `ls -lah ${outputDirectory}`);
});

```
