import gulp from "gulp";
import babel from "gulp-babel";

import paths from "../paths.json";

gulp.task("build-spec", ["build-lib"], () => {
	return gulp.src(paths.source.spec)
		.pipe(babel())
		.pipe(gulp.dest(paths.build.directories.spec));
});
