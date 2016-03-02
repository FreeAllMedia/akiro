import gulp from "gulp";
import mocha from "gulp-mocha";
import istanbul from "gulp-istanbul";
import paths from "../paths.json";

import chai from "chai";
chai.should(); // This enables should-style syntax

gulp.task("test-local", ["build"], (cb) => {
  gulp.src(paths.build.lib)
    .pipe(istanbul()) // Covering files
    .pipe(istanbul.hookRequire()) // Force `require` to return covered files
    .on("finish", () => {
      gulp.src(paths.build.spec)
        .pipe(mocha())
        .pipe(istanbul.writeReports({dir: `${__dirname}/../`, reporters: ["text-summary", "lcovonly"]})) // Creating the reports after tests ran
		//.pipe(istanbul.enforceThresholds({ thresholds: { global: 90 } })) // Enforce a coverage of at least 90%
        .on("end", cb);
    });
});
