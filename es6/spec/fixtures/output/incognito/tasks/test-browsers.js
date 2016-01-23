var gulp = require("gulp");
var karma = require("karma").server;

gulp.task("test-browsers", ["build"], function (done) {
	/**
	 * This ensures that the browser tests only run on the first job,
	 * instead of wastefully running the browser tests on every job.
	 */
	if (process.env.TRAVIS_BUILD_NUMBER) {
		if (process.env.TRAVIS_JOB_NUMBER === `${process.env.TRAVIS_BUILD_NUMBER}.1`) {
			runKarma(done);
		} else {
			done();
		}
	} else {
		runKarma(done);
	}
});

function runKarma(done) {
	karma.start({
		configFile: __dirname + "/../.karma.conf.js"
	}, done);
}
