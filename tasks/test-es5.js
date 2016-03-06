import gulp from "gulp";
import mocha from "gulp-mocha";
import paths from "../paths.json";

import chai from "chai";
chai.should(); // This enables should-style syntax

gulp.task("test-es5", ["build"], () => {
	return gulp.src(paths.build.spec)
		.pipe(mocha());
});
