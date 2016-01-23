import temp from "temp";
import Async from "flowsync";
import fileSystem from "fs-extra";
import { exec } from "child_process";
import archiver from "archiver";
import glob from "glob";
import path from "path";
import AWS from "aws-sdk";

export default class AkiroBuilder {
	constructor(event, context) {
		this.AWS = context.AWS || AWS;
		this.exec = context.exec || exec;
		this.temp = context.temp || temp;
		this.fileSystem = context.fileSystem || fileSystem;
		this.npmPath = context.npmPath || `./node_modules/npm/bin/npm-cli.js`;
	}

	invoke(event, context) {
		let parameters = {};

		Async.series([
			(done) => {
				this.temp.mkdir("akiroBuilder", (error, temporaryDirectoryPath) => {
					parameters.temporaryDirectoryPath = temporaryDirectoryPath;
					done(error);
				});
			},
			(done) => {
				const temporaryDirectoryPath = parameters.temporaryDirectoryPath;
				const commands = [
					`cd ${temporaryDirectoryPath}`,
					`node ${this.npmPath} init -y`
				];
				this.exec(commands.join(";"), (initError) => {
					this.exec(`npm info ${event.package.name} version`, (infoError, stdOut) => {
						const version = stdOut;
						parameters.version = version;
						done(initError);
					});
				});
			},
			(done) => {
				const temporaryDirectoryPath = parameters.temporaryDirectoryPath;
				const packageJsonFilePath = `${temporaryDirectoryPath}/package.json`;
				const packageJson = require(packageJsonFilePath);
				packageJson.dependencies = { [event.package.name]: event.package.version };
				this.fileSystem.writeFile(packageJsonFilePath, JSON.stringify(packageJson), (error) => {
					done(error);
				});
			},
			(done) => {
				const temporaryDirectoryPath = parameters.temporaryDirectoryPath;
				const commands = [
					`cd ${temporaryDirectoryPath}`,
					`node ${this.npmPath} install`
				];
				this.exec(commands.join(";"), (error) => {
					done(error);
				});
			},
			(done) => {
				const temporaryDirectoryPath = parameters.temporaryDirectoryPath;
				const packagesZip = archiver("zip", {});
				const nodeModulesGlob = `${temporaryDirectoryPath}/node_modules/**/*`;
				glob(nodeModulesGlob, { dot: true }, (error, filePaths) => {
					filePaths.forEach((filePath) => {
						const isDirectory = this.fileSystem.statSync(filePath).isDirectory();
						if (!isDirectory) {
							const fileReadStream = this.fileSystem.createReadStream(filePath);
							const relativeFilePath = path.relative(`${temporaryDirectoryPath}/node_modules/`, filePath);
							packagesZip.append(fileReadStream, { name: relativeFilePath } );
						}
					});

					const zipFileWriteStream = this.fileSystem.createWriteStream(`${temporaryDirectoryPath}/package.zip`);

					zipFileWriteStream.on("close", () => {
						done(null);
					});
					packagesZip.pipe(zipFileWriteStream);
					packagesZip.finalize();
				});
			},
			(done) => {
				if (event.region && event.bucket) {
					const temporaryDirectoryPath = parameters.temporaryDirectoryPath;
					const version = parameters.version;
					const s3 = new this.AWS.S3({ region: event.region });

					const packageZipFilePath = `${temporaryDirectoryPath}/package.zip`;

					const packageZipReadBuffer = this.fileSystem.readFileSync(packageZipFilePath);

					const fileName = `${event.package.name}-${version}.zip`;

					parameters.fileName = fileName;

					s3.putObject({
						Bucket: event.bucket,
						Key: fileName,
						Body: packageZipReadBuffer
					}, done);
				} else {
					done();
				}
			},
			(done) => {
				if (context.localFilePath) {
					const temporaryDirectoryPath = parameters.temporaryDirectoryPath;
					const packageZipFilePath = `${temporaryDirectoryPath}/package.zip`;
					fileSystem.copy(packageZipFilePath, context.localFilePath, done);
				} else {
					done();
				}
			}
		], (error) => {
			if (error) {
				context.fail(error);
			} else {
				context.succeed({
					fileName: parameters.fileName
				});
			}
		});
	}
}
