import gulp from "gulp";
import paths from "../paths.json";

gulp.task("copy-source", () => {
	return gulp.src(paths.source.lib)
		.pipe(gulp.dest(paths.build.directories.lib));
});
