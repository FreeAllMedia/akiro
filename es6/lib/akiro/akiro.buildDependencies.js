import privateData from "incognito";

export default function buildDependencies(done) {
	const NpmPackageBuilder = privateData(this).NpmPackageBuilder;
	const npmPackageBuilder = new NpmPackageBuilder(this.builderDependencies(), `${this.temporaryDirectoryPath()}/node_modules`);
	npmPackageBuilder.build(done);
}
