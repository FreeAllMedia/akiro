# Incognito.js [![npm version](https://img.shields.io/npm/v/incognito.svg)](https://www.npmjs.com/package/incognito) [![license type](https://img.shields.io/npm/l/incognito.svg)](https://github.com/FreeAllMedia/incognito.git/blob/master/LICENSE) [![npm downloads](https://img.shields.io/npm/dm/incognito.svg)](https://www.npmjs.com/package/incognito) ![ECMAScript 6 & 5](https://img.shields.io/badge/ECMAScript-6%20/%205-red.svg)

Private properties for your classes. It saves you to define a function on top of each module to get a namespace.

```javascript
import privateData from "incognito";

class Cup {
	constructor() {
		privateData(this).content = "water";
	}

	getContent() {
		return privateData(this).content;
	}
}
```

# Quality and Compatibility

[![Build Status](https://travis-ci.org/FreeAllMedia/incognito.png?branch=master)](https://travis-ci.org/FreeAllMedia/incognito) [![Coverage Status](https://coveralls.io/repos/FreeAllMedia/incognito/badge.svg)](https://coveralls.io/r/FreeAllMedia/incognito) [![bitHound Score](https://www.bithound.io/github/FreeAllMedia/incognito/badges/score.svg)](https://www.bithound.io/github/FreeAllMedia/incognito)  [![Dependency Status](https://david-dm.org/FreeAllMedia/incognito.png?theme=shields.io)](https://david-dm.org/FreeAllMedia/incognito?theme=shields.io) [![Dev Dependency Status](https://david-dm.org/FreeAllMedia/incognito/dev-status.svg)](https://david-dm.org/FreeAllMedia/incognito?theme=shields.io#info=devDependencies)

*Every build and release is automatically tested on the following platforms:*

![node 0.12.x](https://img.shields.io/badge/node-0.12.x-brightgreen.svg) ![node 0.11.x](https://img.shields.io/badge/node-0.11.x-brightgreen.svg) ![node 0.10.x](https://img.shields.io/badge/node-0.10.x-brightgreen.svg)
![iojs 2.x.x](https://img.shields.io/badge/iojs-2.x.x-brightgreen.svg) ![iojs 1.x.x](https://img.shields.io/badge/iojs-1.x.x-brightgreen.svg)


[![Sauce Test Status](https://saucelabs.com/browser-matrix/incognito.svg)](https://saucelabs.com/u/incognito)


*If your platform is not listed above, you can test your local environment for compatibility by copying and pasting the following commands into your terminal:*

```
npm install incognito
cd node_modules/incognito
gulp test-local
```

# Installation

Copy and paste the following command into your terminal to install Incognito:

```
npm install incognito --save
```

## Import / Require

```
// ES6
import incognito from "incognito";
```

```
// ES5
var incognito = require("incognito");
```

```
// Require.js
define(["require"] , function (require) {
    var incognito = require("incognito");
});
```

# Getting Started
So simple. Read the instructions at the top.

# How to Contribute

See something that could use improvement? Have a great feature idea? We listen!

You can submit your ideas through our [issues system](https://github.com/FreeAllMedia/incognito/issues), or make the modifications yourself and submit them to us in the form of a [GitHub pull request](https://help.github.com/articles/using-pull-requests/).

We always aim to be friendly and helpful.

## Running Tests

It's easy to run the test suite locally, and *highly recommended* if you're using Incognito.js on a platform we aren't automatically testing for.

```
npm test
```
