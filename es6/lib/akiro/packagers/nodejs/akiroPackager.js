import temp from "temp";
import Async from "flowsync";
import fileSystem from "fs-extra";
import { exec } from "child_process";
import archiver from "archiver";
import glob from "glob";
import path from "path";
import AWS from "aws-sdk";

export default class AkiroPackager {
	constructor(event, context) {
		this.AWS = context.AWS || AWS;
		this.exec = context.exec || exec;
		this.temp = context.temp || temp;
		this.npmPath = context.npmPath || `./node_modules/npm`;
	}

	invoke(event, context) {
		Async.waterfall([
			(done) => {
				this.temp.mkdir("akiroPackager", done);
			},
			(temporaryDirectoryPath, done) => {
				const temporaryNpmPath = `${temporaryDirectoryPath}/node_modules/npm`;
				fileSystem.copy(this.npmPath, temporaryNpmPath, (error) => {
					done(error, temporaryDirectoryPath);
				});
			},
			(temporaryDirectoryPath, done) => {
				const commands = [
					`cd ${temporaryDirectoryPath}`,
					`node ${temporaryDirectoryPath}/node_modules/npm/bin/npm-cli.js init -y`
				];
				this.exec(commands.join(";"), (error) => {
					done(error, temporaryDirectoryPath);
				});
			},
			(temporaryDirectoryPath, done) => {
				const packageJsonFilePath = `${temporaryDirectoryPath}/package.json`;
				const packageJson = require(packageJsonFilePath);
				packageJson.dependencies = event.packages;
				fileSystem.writeFile(packageJsonFilePath, JSON.stringify(packageJson), (error) => {
					done(error, temporaryDirectoryPath);
				});
			},
			(temporaryDirectoryPath, done) => {
				const commands = [
					`cd ${temporaryDirectoryPath}`,
					`node ${temporaryDirectoryPath}/node_modules/npm/bin/npm-cli.js install`
				];
				this.exec(commands.join(";"), (error) => {
					done(error, temporaryDirectoryPath);
				});
			},
			(temporaryDirectoryPath, done) => {
				const packagesZip = archiver("zip", {});
				const nodeModulesGlob = `${temporaryDirectoryPath}/node_modules/**/*`;
				glob(nodeModulesGlob, { dot: true }, (error, filePaths) => {
					filePaths.forEach((filePath) => {
						const isDirectory = fileSystem.statSync(filePath).isDirectory();
						if (!isDirectory) {
							const fileReadStream = fileSystem.createReadStream(filePath);
							const relativeFilePath = path.relative(`${temporaryDirectoryPath}/node_modules/`, filePath);
							packagesZip.append(fileReadStream, { name: relativeFilePath } );
						}
					});

					const zipFileWriteStream = fileSystem.createWriteStream(`${temporaryDirectoryPath}/packages.zip`);

					zipFileWriteStream.on("close", done);
					packagesZip.pipe(zipFileWriteStream);
					packagesZip.finalize();

				});
			}
		], (error) => {
			if (error) {
				context.fail(error);
			} else {
				context.succeed();
			}
		});
	}
}
