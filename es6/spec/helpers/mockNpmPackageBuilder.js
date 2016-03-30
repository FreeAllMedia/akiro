import ChainLink from "mrt";

export default class MockNpmPackageBuilder extends ChainLink {
	initialize() {
		this.parameters("packageList", "outputDirectoryPath", "basePath", "npmPath");
	}
}
