import NpmPackageBuilder from "../npmPackageBuilder/npmPackageBuilder.js";
import Async from "flowsync";

export default function install(callback) {
	Async.series([
			require("./akiro.buildDependencies.js").default.bind(this)
		],
		callback
	);
}
