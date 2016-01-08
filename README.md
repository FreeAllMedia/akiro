# Akiro.js [![npm version](https://img.shields.io/npm/v/akiro.svg)](https://www.npmjs.com/package/akiro) [![license type](https://img.shields.io/npm/l/akiro.svg)](https://github.com/FreeAllMedia/akiro.git/blob/master/LICENSE) [![npm downloads](https://img.shields.io/npm/dm/akiro.svg)](https://www.npmjs.com/package/akiro)

Certain packages you may want to use in AWS Lambda rely upon compiling native code for the architecture it will be running on. This poses a problem when dependencies are compiled on our local development machines then expected to run on the AWS Lambda architecture.

Akiro.js takes a list of packages and version numbers, invokes a special Lambda function with them that builds each package within the AWS Lambda environment, then zips and delivers them to you or an S3 bucket.

* [Compatibility & Quality](#compatibility--quality)
* [How it Works](#how-it-works)
* [Installation](#installation)
	* [Configuration](#configuration)
* [Usage](#usage)
	* [akiro.initialize([callback])](#akiroinitializecallback)
	* [akiro.package(packageList, s3BucketName, [options,] [callback])](#akiropackagepackagelist-s3bucketname-options-callback)
* [Contributing](#we-love-contributors)

## Compatibility & Quality

![ECMAScript 6 & 5](https://img.shields.io/badge/ECMAScript-6%20/%205-red.svg) ![node 0.12.x](https://img.shields.io/badge/node-0.12.x-brightgreen.svg) ![node 0.11.x](https://img.shields.io/badge/node-0.11.x-brightgreen.svg) ![node 0.10.x](https://img.shields.io/badge/node-0.10.x-brightgreen.svg) ![iojs 2.x.x](https://img.shields.io/badge/iojs-2.x.x-brightgreen.svg) ![iojs 1.x.x](https://img.shields.io/badge/iojs-1.x.x-brightgreen.svg)

[![Build Status](https://travis-ci.org/FreeAllMedia/akiro.png?branch=master)](https://travis-ci.org/FreeAllMedia/akiro) [![Dependency Status](https://david-dm.org/FreeAllMedia/akiro.png?theme=shields.io)](https://david-dm.org/FreeAllMedia/akiro?theme=shields.io) [![Dev Dependency Status](https://david-dm.org/FreeAllMedia/akiro/dev-status.svg)](https://david-dm.org/FreeAllMedia/akiro?theme=shields.io#info=devDependencies)

[![Coverage Status](https://coveralls.io/repos/FreeAllMedia/akiro/badge.svg)](https://coveralls.io/r/FreeAllMedia/akiro) [![Code Climate](https://codeclimate.com/github/FreeAllMedia/akiro/badges/gpa.svg)](https://codeclimate.com/github/FreeAllMedia/akiro) [![bitHound Score](https://www.bithound.io/github/FreeAllMedia/akiro/badges/score.svg)](https://www.bithound.io/github/FreeAllMedia/akiro)

# How it Works

**1. `akiro.initialize(iamRoleName, [callback])`**

* Creates an AWS Lambda called the `Akiro Packager` on your account using the designated IAM Role.
* This step only needs to be completed once when Akiro is first used and after upgrading Akiro to a new version.

**2. `akiro.package(bucketName, packageList, [localZipFilePath,] [callback])`**

* Sends a list of package names and their respective version numbers to the `Akiro Packager`.
* `Akiro Packager` builds all of the designated packages on the AWS Lambda architecture, ensuring full compatibility for packages containing native code such as C, C++, etc.
* `Akiro Packager` puts all of the built packages into a .zip file, saves it to an S3 bucket.
* Optionally, you can provide a `localZipFilePath` to automatically download the package zip to the designated path.


# Installation

* To use Akiro as a library in your own scripts, install locally via npm:

	``` shell
	npm install akiro --save-dev
	```

## Configuration

**Setup `~/.aws/credentials`**

* For now, Akiro expects there to be an ~/.aws/credentials file.
* For more information on how to set up this file, [read this guide](http://docs.aws.amazon.com/AWSJavaScriptSDK/guide/node-configuring.html#Credentials_from_the_Shared_Credentials_File_____aws_credentials_).
* We will add support for specifying credentials manually.

# Usage

Akiro has two primary functions: `.initialize()` and `.package()`.

## akiro.initialize([callback])

Build and upload the `Akiro Packager` to S3, with an optional callback.

**Note:** This method will replace the prior initialized version of `Akiro Packager` on AWS Lambda with the current version.

**Arguments:**

argument|type						|description			|optional
:-------|:--------------|:----------------|--------
callback|function(error)|Called after initialization has completed, or an error has returned.|true

**Example:**

``` javascript
import Akiro from "akiro";

const config = {
	role: "IAMRoleNameHere"
};

const akiro = new Akiro(config);

akiro.initialize((error) => {
	if (error) { throw error; }
	console.log("Akiro initialization complete!");
});
```

## akiro.package(packageList, s3BucketName, [options,] [callback])

Provide a list of package names and versions to build on AWS Lambda, then put into a zip file on S3.

**Arguments:**

argument						|type						|description						|optional
:-------------------|:--------------|:----------------------|--------
packageList					|Object         |List of each package and a corresponding version range to build.|false
s3BucketName				|String         |S3 bucket where the package zip file is saved to.|false
options							|Object         |Optional options object. See below for more information.|true
callback						|function(error)|Called after initialization has completed, or an error has returned.|true

**Options:**

option							|type						|default value	|description						
:-------------------|:--------------|:--------------|:----------------
s3FileName					|String         |"packages.zip"	|Provide an alternate filename to the default of "packages.zip".
localFilePath				|String         |undefined			|If provided, the zip file will be downloaded from S3 to the designated file path.

**Example 1. Save Package Zip to Local File:**

* To save a package zip to a local file, you only need to provide the `localFilePath` option.
* After the `Akiro Packager` is complete, the zip file will download automatically to the `localFilePath` provided.
* **Note:** Even when downloading the package zip to a local file, the copy on S3 won't be deleted.

``` javascript
import Akiro from "akiro";

const akiro = new Akiro();

const packageList = {
	"async": "1.0.0",
	"incognito": "^0.1.0"
};

const bucketName = "bucketNameHere";

const options = {
	localFilePath: "./myLocalPackages.zip"
};

akiro.package(packageList, bucketName, options, (error, data) => {
	if (error) { throw error; }
	console.log(data.url); // http://branchNameHere.s3-us-east-1.amazonaws.com/packages.zip
});
```

**Example 2. Save Package Zip to S3 Bucket:**

* This is used if you don't need the .zip file saved to your local machine.
* The file name used on the designated S3 bucket will default to "packages.zip".

``` javascript
import Akiro from "akiro";

const akiro = new Akiro();

const packageList = {
	"async": "1.0.0",
	"incognito": "^0.1.0"
};

const bucketName = "bucketNameHere";

akiro.package(packageList, bucketName, (error, data) => {
	if (error) { throw error; }
	console.log(data.url); // http://branchNameHere.s3-us-east-1.amazonaws.com/packages.zip
});
```

**Example 3. Change the file name of the Package Zip on S3:**

* By default Akiro uses the file name, "packages.zip" on S3.
* You can specify a different file name with the `s3FileName` option.

``` javascript
import Akiro from "akiro";

const akiro = new Akiro();

const packageList = {
	"async": "1.0.0",
	"incognito": "^0.1.0"
};

const bucketName = "bucketNameHere";

const options = {
	s3FileName: "differentName.zip"
};

akiro.package(packageList, bucketName, options, (error, data) => {
	if (error) { throw error; }
	console.log(data.url); // http://branchNameHere.s3-us-east-1.amazonaws.com/differentName.zip
});
```

# We Love Contributors!

Want to contribute to this repo? Our teams welcome all quality contributions!

* **"What is a quality contribution?"**
	* **All submitted code must have zero issues when linted against the supplied `.eslintrc` guidelines.**
	 	* All `.eslintrc` guidelines should be followed *as-is*, with exceptions for impossible/impractical situations (such as when violating the `new-cap` rule by utilizing 3rd-party libraries that has Uppercase function names).
	* **Test coverage must remain at 100%.**
		* Please don't rely upon the core devs to write post-hoc tests. This software should remain test-*driven*.
		* If there are serious considerations as to why the 100% limit should be broken, please submit a new issue discussing it.
	* **Tests must be well-designed.**
		* Each test should be carefully designed so that it is covering off on new scenarios, while avoiding overlap with others.
		* One assertion per test (*it* block). Please don't make us comment out a bunch of assertions to find out which one failed.
* **"What if I'm unsure about something?"**
	* **Create an issue**
		* We watch our issues very carefully. Please utilize it for all questions, comments, and requests.
