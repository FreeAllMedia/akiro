import ChainLink from "mrt";
import AkiroPackage from "../akiroPackage/akiroPackage.js";

const setupPackages = Symbol();

export default class AkiroPackages extends ChainLink {
	initialize(requestedPackages) {
		this.parameters("requestedPackages");
		this.requestedPackages(requestedPackages);

		this
			.link("newPackage", AkiroPackage)
			.into("packageList")
			.usingKey("name");

		this[setupPackages](requestedPackages);
	}

	[setupPackages](requestedPackages) {
		for (let packageName in requestedPackages) {
			let packageVersion = requestedPackages[packageName];

			this.newPackage(packageName, packageVersion);
		}
	}

	package(packageName) {
		return this.packageList[packageName];
	}
}
