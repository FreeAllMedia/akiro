import gulp from "gulp";
//import babel from "gulp-babel";

import paths from "../paths.json";

gulp.task("build-lib-assets", () => {
	return gulp.src(paths.source.specAssets)
		.pipe(gulp.dest(paths.build.directories.spec));
});
