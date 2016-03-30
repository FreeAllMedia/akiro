import ChainLink from "mrt";

export default class AkiroPackage extends ChainLink {
	initialize(packageName, packageVersion) {
		this.parameters("name", "version");
		this.name(packageName);
		this.version(packageVersion);
	}
}
