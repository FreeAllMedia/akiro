import temp from "temp";
import Async from "flowsync";
import fileSystem from "fs-extra";

export default class AkiroPackager {
	constructor(event, context) {
		this.temp = context.temp || temp;
		this.npmPath = context.npmPath || `./node_modules/npm`;
	}

	invoke(event, context) {
		Async.waterfall([
			(done) => {
				this.temp.mkdir("akiroPackager", done);
			},
			(temporaryDirectoryPath, done) => {
				const temporaryNpmPath = `${temporaryDirectoryPath}/node_modules/npm`;
				fileSystem.copy(this.npmPath, temporaryNpmPath, done);
			}
		], (error) => {
			if (error) {
				context.fail(error);
			} else {
				context.succeed();
			}
		});
	}
}
