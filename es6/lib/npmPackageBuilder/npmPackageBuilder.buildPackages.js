export default function buildPackages(done) {
	const commands = [
		`cd ${this.outputDirectoryPath()}`,
		`node ${this.npmPath()} install`
	];

	this.libraries.exec(commands.join(";"), done);
}
