import gulp from "gulp";
import compare from "compare-version";
import run from "run-sequence";

gulp.task("test", callback => {
	if (compare(process.version, "4.0.0") >= 0) {
		run("test-es6", callback);
	} else {
		run("test-es5", callback);
	}
});
