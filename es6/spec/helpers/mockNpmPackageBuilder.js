import ChainLink from "mrt";
import fileSystem from "fs-extra";

export default class MockNpmPackageBuilder extends ChainLink {
	initialize(packageList, outputDirectoryPath) {
		this.parameters("packageList", "outputDirectoryPath", "basePath", "npmPath");
		this.packageList(packageList);
		this.outputDirectoryPath(outputDirectoryPath);
	}

	build(done) {
		for (let packageName in this.packageList()) {
			fileSystem.copySync(`${__dirname}/../../../node_modules/${packageName}`, `${this.outputDirectoryPath()}/${packageName}`);
		}

		done();
	}
}
