/* eslint-disable no-process-exit */
import gulp from "gulp";
import mocha from "gulp-mocha";
import istanbul from "gulp-babel-istanbul";
import paths from "../paths.json";

import chai from "chai";
chai.should(); // This enables should-style syntax

gulp.task("test-es6", ["build"], () => {
	gulp.src(paths.source.lib)
		.pipe(istanbul()) // Covering files
		.pipe(istanbul.hookRequire()) // Force `require` to return covered files
		.on("finish", () => {
			gulp.src(paths.build.sourceSpec)
				.pipe(mocha())
				.pipe(istanbul.writeReports({dir: `${__dirname}/../`, reporters: ["text-summary", "lcovonly"]})) // Creating the reports after tests ran
				//.pipe(istanbul.enforceThresholds({ thresholds: { global: 100 } })) // Enforce a coverage of 100%
				// .once("error", function () {
				// 	process.exit(1);
				// })
				// .once("end", function () {
				// 	process.exit();
				// });
		});
});
