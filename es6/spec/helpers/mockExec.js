import sinon from "sinon";
import fileSystem from "fs-extra";

export default function createMockExec(temporaryDirectoryPath, nodeModulesDirectoryPath) {
	return sinon.spy((command, callback) => {
		const nodeCliPath = `${temporaryDirectoryPath}/node_modules/npm/bin/npm-cli.js`;
		switch(command) {
			case `cd ${temporaryDirectoryPath};node ${nodeCliPath} init -y`:
				const newPackageJson = require(`${__dirname}/../fixtures/newPackage.json`);
				fileSystem.writeFile(`${temporaryDirectoryPath}/package.json`, JSON.stringify(newPackageJson), (error) => {
					callback(error);
				});
				break;
			case `cd ${temporaryDirectoryPath};node ${nodeCliPath} install`:
				fileSystem.copy(`${nodeModulesDirectoryPath}/async`, `${temporaryDirectoryPath}/node_modules/async`, (error) => {
					callback(error);
				});
				break;
			default:
				callback(new Error(`exec called with '${command}', but it is not mocked.`));
		}
	});
}
