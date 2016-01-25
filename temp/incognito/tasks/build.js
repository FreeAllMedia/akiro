import gulp from "gulp";

gulp.task("build", ["build-lib", "build-spec", "build-lib-assets", "build-spec-assets"]);
