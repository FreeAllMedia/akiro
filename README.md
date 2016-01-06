# Akiro.js [![npm version](https://img.shields.io/npm/v/akiro.svg)](https://www.npmjs.com/package/akiro) [![license type](https://img.shields.io/npm/l/akiro.svg)](https://github.com/FreeAllMedia/akiro.git/blob/master/LICENSE) [![npm downloads](https://img.shields.io/npm/dm/akiro.svg)](https://www.npmjs.com/package/akiro)

Akiro is a wizard that takes packages from your specified package manager and builds them on AWS Lambda to ensure their compatibility when used in AWS Lambda functions.

It works by first deploying the `Akiro Lambda` to your AWS account. Then, you simply call the Akiro Lambda with a list of packages you want it to build within the Lambda, zip into a file, and send you the URL to.

**Quality Control**

[![Build Status](https://travis-ci.org/FreeAllMedia/akiro.png?branch=master)](https://travis-ci.org/FreeAllMedia/akiro) [![Coverage Status](https://coveralls.io/repos/FreeAllMedia/akiro/badge.svg)](https://coveralls.io/r/FreeAllMedia/akiro) [![Code Climate](https://codeclimate.com/github/FreeAllMedia/akiro/badges/gpa.svg)](https://codeclimate.com/github/FreeAllMedia/akiro)  [![bitHound Score](https://www.bithound.io/github/FreeAllMedia/akiro/badges/score.svg)](https://www.bithound.io/github/FreeAllMedia/akiro)  [![Dependency Status](https://david-dm.org/FreeAllMedia/akiro.png?theme=shields.io)](https://david-dm.org/FreeAllMedia/akiro?theme=shields.io) [![Dev Dependency Status](https://david-dm.org/FreeAllMedia/akiro/dev-status.svg)](https://david-dm.org/FreeAllMedia/akiro?theme=shields.io#info=devDependencies)

**Compatibility**

![ECMAScript 6 & 5](https://img.shields.io/badge/ECMAScript-6%20/%205-red.svg) ![node 0.12.x](https://img.shields.io/badge/node-0.12.x-brightgreen.svg) ![node 0.11.x](https://img.shields.io/badge/node-0.11.x-brightgreen.svg) ![node 0.10.x](https://img.shields.io/badge/node-0.10.x-brightgreen.svg) ![iojs 2.x.x](https://img.shields.io/badge/iojs-2.x.x-brightgreen.svg) ![iojs 1.x.x](https://img.shields.io/badge/iojs-1.x.x-brightgreen.svg)

# Installation

Akiro is intended to be used primarily through its command line interface, though it's possible to use Akiro programmatically as well.

To use Akiro via command line, install globally via npm:

``` shell
npm install akiro -g
```

To use Akiro programmatically, install locally via npm:

``` shell
npm install akiro --save-dev
```

# Command Line Interface

This section will go over using Akiro as a command line utility.

**Note:** Akiro assumes that you have already setup your `~/.aws/credentials` file. If you have not, make sure that you do before you attempt to use Akiro.

## 1. Deploy The Akiro Packager Lambda

Before Akiro will work, you'll need to deploy the Akiro Packager Lambda by running the following command:

``` shell
akiro deploy
```

## 2. Specify an S3 branch

Akiro needs to know which branch you want to put the packages zip file when it is done building. You can do this in two ways:

1. Provide a default branch via:

	``` shell
	akiro branch branchNameHere
	```

2. Provide a branch on a per-call bases via the `--branch` flag:

	``` shell
	akiro package sqlite3 --branch=branchNameHere
	```

## 3. Compile Dependencies, Get Zip URL

**The Akiro CLI takes a bucket name as the first argument**, then one or more package names. It can also accept one or more options such as `--name` to specify the package file's eventual name on s3.

### 3.1 Zip the latest version of a package

If no version is supplied, the latest version of a package will be used.

``` shell
akiro package myS3Bucket sqlite3
building package, please wait ...........
Package available at: http://myS3Bucket.s3-us-east-1.amazonaws.com/packages.zip
```

### 3.2 Zip a specific version of a package

To use a specific version of a package, use the following syntax:

``` shell
akiro package myS3Bucket sqlite3@1.1.0
building package, please wait ...........
Package available at: http://myS3Bucket.s3-us-east-1.amazonaws.com/packages.zip
```

### 3.3 Zip multiple packages into a single file



``` shell
akiro package myS3Bucket sqlite3@1.1.0 temp@^1.0.0
building package, please wait ...........
Package available at: http://myS3Bucket.s3-us-east-1.amazonaws.com/packages.zip
```

### 3.4 Specify the zip file name

By default Akiro will create a "packages.zip" file in the bucket you specify. If you want to change this name to something else, simply supply the `--name` flag at the end of your command.

``` shell
akiro package myS3Bucket sqlite3 --name=sqlite3.zip
building package, please wait ...........
Package available at: http://myS3Bucket.s3-us-east-1.amazonaws.com/sqlite3.zip
```

## Node.js Interface

This section will go over using Akiro as a node.js package.

**Note:** Akiro assumes that you have already setup your `~/.aws/credentials` file. If you have not, make sure that you do before you attempt to use Akiro.

## 1. Deploy The Akiro Packager Lambda

``` javascript
import Akiro from "akiro";

const akiro = new Akiro();

akiro.deploy("bucketNameHere", (error) => {
	if (error) { throw error; }
});
```

## 2. Specify an S3 branch

``` javascript
import Akiro from "akiro";

const akiro = new Akiro({
	bucket: "bucketNameHere"
});
```

## 3. Compile Dependencies, Get Zip URL

### 3.1 Zip the latest version of a package

``` javascript
import Akiro from "akiro";

const akiro = new Akiro({
	bucket: "bucketNameHere"
});

akiro.package("sqlite3", (error, packageUrl) => {
	if (error) { throw error; }
	console.log(packageUrl); // http://myS3Bucket.s3-us-east-1.amazonaws.com/packages.zip
});
```

### 3.2 Zip a specific version of a package

``` javascript
import Akiro from "akiro";

const akiro = new Akiro({
	bucket: "bucketNameHere"
});

akiro.package("sqlite3@1.1.3", (error, packageUrl) => {
	if (error) { throw error; }
	console.log(packageUrl); // http://myS3Bucket.s3-us-east-1.amazonaws.com/packages.zip
});
```

### 3.3 Zip multiple packages into a single file

``` javascript
import Akiro from "akiro";

const akiro = new Akiro({
	bucket: "bucketNameHere"
});

const packages = [
	"sqlite3@1.1.3",
	"temp@^1.0.1"
];

akiro.package(packages, (error, packageUrl) => {
	if (error) { throw error; }
	console.log(packageUrl); // http://myS3Bucket.s3-us-east-1.amazonaws.com/packages.zip
});
```

### 3.4 Specify the zip file name

``` javascript
import Akiro from "akiro";

const akiro = new Akiro({
	bucket: "bucketNameHere"
});

const package = "sqlite3@1.1.3";

akiro.package(package, { fileName: "sqlite3.zip" }, (error, packageUrl) => {
	if (error) { throw error; }
	console.log(packageUrl); // http://myS3Bucket.s3-us-east-1.amazonaws.com/sqlite3.zip
});
```
