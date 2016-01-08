# Akiro.js [![npm version](https://img.shields.io/npm/v/akiro.svg)](https://www.npmjs.com/package/akiro) [![license type](https://img.shields.io/npm/l/akiro.svg)](https://github.com/FreeAllMedia/akiro.git/blob/master/LICENSE) [![npm downloads](https://img.shields.io/npm/dm/akiro.svg)](https://www.npmjs.com/package/akiro)

Akiro is a stand-alone library with a command line interface that takes a list of packages, then invokes a magic Lambda function that builds all of those packages within the Lambda environment itself. This makes compilation of native libraries for lambda effortless and seamless.

**Compatibility**

![ECMAScript 6 & 5](https://img.shields.io/badge/ECMAScript-6%20/%205-red.svg) ![node 0.12.x](https://img.shields.io/badge/node-0.12.x-brightgreen.svg) ![node 0.11.x](https://img.shields.io/badge/node-0.11.x-brightgreen.svg) ![node 0.10.x](https://img.shields.io/badge/node-0.10.x-brightgreen.svg) ![iojs 2.x.x](https://img.shields.io/badge/iojs-2.x.x-brightgreen.svg) ![iojs 1.x.x](https://img.shields.io/badge/iojs-1.x.x-brightgreen.svg)

**Quality Control**

[![Build Status](https://travis-ci.org/FreeAllMedia/akiro.png?branch=master)](https://travis-ci.org/FreeAllMedia/akiro) [![Coverage Status](https://coveralls.io/repos/FreeAllMedia/akiro/badge.svg)](https://coveralls.io/r/FreeAllMedia/akiro) [![Code Climate](https://codeclimate.com/github/FreeAllMedia/akiro/badges/gpa.svg)](https://codeclimate.com/github/FreeAllMedia/akiro)  [![bitHound Score](https://www.bithound.io/github/FreeAllMedia/akiro/badges/score.svg)](https://www.bithound.io/github/FreeAllMedia/akiro)  [![Dependency Status](https://david-dm.org/FreeAllMedia/akiro.png?theme=shields.io)](https://david-dm.org/FreeAllMedia/akiro?theme=shields.io) [![Dev Dependency Status](https://david-dm.org/FreeAllMedia/akiro/dev-status.svg)](https://david-dm.org/FreeAllMedia/akiro?theme=shields.io#info=devDependencies)

# Installation

To use Akiro as a library in your own scripts, install locally via npm:

``` shell
npm install akiro --save-dev
```

# Configuration

## Setup your `~/.aws/credentials`

Akiro expects there to be an ~/.aws/credentials file. For more information on how to set up this file, [read this guide](http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html#Credentials_from_the_Shared_Credentials_File_____aws_credentials_).

# Usage

## .deploy(callback)

Before any Akiro magic can happen, the `Akiro Lambda` must be deployed to S3.

``` javascript
import Akiro from "akiro";

const config = {
	role: "IAMRoleNameHere"
};

const akiro = new Akiro(config);

akiro.deploy((error) => {
	if (error) { throw error; }
	console.log("Akiro deployment complete!");
});
```

name		|type						|description
:-------|:--------------|:----------
callback|function(error)|Called after deployment has completed, or an error has returned.

## .package(packageList, [localZipFilePath,] callback);

Provide a list of package names and versions to build on AWS Lambda, then put into a zip file on S3.

### Packaging to a local .zip file:

``` javascript
import Akiro from "akiro";

const config = {
	bucket: "bucketNameHere"
};

const akiro = new Akiro(config);

const packageList = {
	"async": "1.0.0",
	"incognito": "^0.1.0"
};

const localZipFilePath = "./packages.zip";

akiro.package(packageList, localZipFilePath, (error) => {
	if (error) { throw error; }
	console.log(`${localZipFilePath} has completed packaging and downloading.`);
});
```

### Packaging to a remote S3 .zip file:

``` javascript
import Akiro from "akiro";

const config = {
	bucket: "bucketNameHere"
};

const akiro = new Akiro(config);

const packageList = {
	"async": "1.0.0",
	"incognito": "^0.1.0"
};

akiro.package(packageList, (error, data) => {
	if (error) { throw error; }

	console.log(data.url);
	// http://branchNameHere.s3-us-east-1.amazonaws.com/packages.zip

	console.log("Akiro deployment complete!");
});
```

|name|type|description|optional|
|-|-|-|-|
|packageList|Object|A list of package names and their corresponding version ranges.|false|
|localZipFilePath|String|A local file path where the package .zip will be downloaded and written to.|true|
|callback|function(error, data)|Called after deployment has completed, or an error has returned.|true|
