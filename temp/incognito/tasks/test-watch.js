import gulp from "gulp";
import paths from "../paths.json";

gulp.task("test-watch", ["suppress-errors"], () => {
  gulp.watch([
    paths.source.lib,
    paths.source.spec,
    paths.source.specAssets,
    paths.source.libAssets
  ], ["test-local"]);
});
