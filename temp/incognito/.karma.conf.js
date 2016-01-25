let frameworks = ["browserify", "mocha", "chai"];

let browsers = [];

let reporters = ["progress"];

let configOptions = {
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: "",

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: frameworks,

    // list of files / patterns to load in the browser
    files: [
      "node_modules/babel/polyfill.js",
      "es5/**/*.js"
    ],

    // list of files to exclude
    exclude: [
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
        "node_modules/babel/polyfill.js": ["browserify"],
        "es5/**/*.js": ["browserify"]
    },

    browserify: {
      debug: false
    },

    // test results reporter to use
    // possible values: "dots", "progress"
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: reporters,


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: browsers, // "Chrome", "Firefox", "Safari", "Opera", "IE"],

    captureTimeout: 120000,

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true
};

/**
 * Special Options For SauceLabs
 */
if (process.env.TRAVIS_BUILD_NUMBER && process.env.SAUCE_USERNAME) {
    /**
     * If SauceLabs credentials are available,
     * set up the tests to run through them.
     */
    configOptions.sauceLabs = {
        testName: "Incognito.js"
    };
    const customLaunchers = require("./.sauce.json").platforms;
    configOptions.customLaunchers = customLaunchers;
    configOptions.browsers = Object.keys(customLaunchers);
    reporters.push("saucelabs");
} else {
    /**
     * If there are no SauceLabs credentials available,
     * detect the browsers that we *can* use.
     */
    frameworks.push("detectBrowsers");
}

module.exports = function(config) {
    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    configOptions.logLevel = config.LOG_DEBUG;

    config.set(configOptions);
};
