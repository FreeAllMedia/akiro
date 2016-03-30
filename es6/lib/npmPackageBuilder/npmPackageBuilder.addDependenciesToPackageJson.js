import fileSystem from "fs";

export default function addDependenciesToPackageJson(done) {
	const packageJsonFilePath = `${this.outputDirectoryPath()}/package.json`;
	const packageJson = require(packageJsonFilePath);
	packageJson.description = "Temporary AkiroBuilder package.json for generation.";
	packageJson.repository = "https://this.doesntreallyexist.com/something.git";
	packageJson.dependencies = this.packageList();
	fileSystem.writeFile(packageJsonFilePath, JSON.stringify(packageJson), done);
}
