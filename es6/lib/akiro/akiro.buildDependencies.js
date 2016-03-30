import NpmPackageBuilder from "../npmPackageBuilder/npmPackageBuilder.js";

export default function buildDependencies(done) {
	const npmPackageBuilder = new NpmPackageBuilder(this.builderDependencies(), this.temporaryDirectoryPath());
	npmPackageBuilder.build(() => {
		console.log("DONE?!?!?!!??!");
		done();
	});
}
