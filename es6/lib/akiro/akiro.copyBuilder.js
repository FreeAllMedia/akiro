import fileSystem from "fs-extra";

export default function copyBuilder(done) {
	fileSystem.copySync(`${__dirname}/../akiroBuilder/npm/akiroBuilder.js`, `${this.temporaryDirectoryPath()}/akiroBuilder.js`);
	fileSystem.copySync(`${__dirname}/../akiroBuilder/npm/handler.js`, `${this.temporaryDirectoryPath()}/handler.js`);
	done();
}
