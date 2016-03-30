import fileSystem from "fs-extra";

export default function movePackages(done) {
	fileSystem
		.copy(
			`${this.outputDirectoryPath()}/node_modules`,
			this.outputDirectoryPath(),
			done
		);
}
