import gulp from "gulp";
import gutil from "gulp-util";

// Watch tasks should depend on suppress-errors - it will force all stream pipes to print but not crash on error
gulp.task("suppress-errors", function () {
		function monkeyPatchPipe(o){
				while (!o.hasOwnProperty("pipe")) {
						o = Object.getPrototypeOf(o);
						if (!o) {
								return;
						}
				}
				var originalPipe = o.pipe;
				var newPipe = function(){
						var result = originalPipe.apply(this, arguments);
						result.setMaxListeners(0);
						if (!result.pipe["monkey patched for suppress-errors"]) {
								monkeyPatchPipe(result);
						}

						return result.on("error", function (err) {
								gutil.log(gutil.colors.yellow(err));
								gutil.beep();
								this.emit("end");
						});
				};
				newPipe["monkey patched for suppress-errors"] = true;
				o.pipe = newPipe;
		}
		monkeyPatchPipe(gulp.src(""));
});
