import Async from "flowsync";

export default function install(callback) {
	Async.series([
			require("./akiro.buildDependencies.js").default.bind(this),
			require("./akiro.copyBuilder.js").default.bind(this),
			require("./akiro.installBuilder.js").default.bind(this)
		],
		callback
	);
}
