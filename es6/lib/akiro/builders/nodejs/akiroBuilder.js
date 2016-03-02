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
		this.npmPath = context.npmPath || `${__dirname}/node_modules/npm/bin/npm-cli.js`;
	}

	status(message) {
		//console.log(message);
	}

	invoke(event, context) {
		let parameters = {};

		Async.series([
			(done) => {
				this.status("Creating temporary directory");
				this.temp.mkdir("akiroBuilder", (error, temporaryDirectoryPath) => {
					this.status(`Temporary directory created: ${temporaryDirectoryPath}`);
					parameters.temporaryDirectoryPath = temporaryDirectoryPath;
					done(error);
				});
			},
			(done) => {
				this.status(`Creating blank package.json file`);
				const temporaryDirectoryPath = parameters.temporaryDirectoryPath;
				const commands = [
					`cd ${temporaryDirectoryPath}`,
					`node ${this.npmPath} init -y`
				];
				this.exec(commands.join(";"), (initError) => {
					this.status(`Blank package.json file created.`);
					done(initError);
				});
			},
			(done) => {
				this.status(`Adding dependencies to package.json`);
				const temporaryDirectoryPath = parameters.temporaryDirectoryPath;
				const packageJsonFilePath = `${temporaryDirectoryPath}/package.json`;
				const packageJson = require(packageJsonFilePath);
				packageJson.description = "Temporary AkiroBuilder package.json for generation.";
				packageJson.repository = "https://this.doesntreallyexist.com/something.git";
				packageJson.dependencies = { [event.package.name]: event.package.version };
				this.fileSystem.writeFile(packageJsonFilePath, JSON.stringify(packageJson), (error) => {
					this.status(`Dependencies added to package.json`);
					done(error);
				});
			},
			(done) => {
				this.status(`Installing dependencies`);
				const temporaryDirectoryPath = parameters.temporaryDirectoryPath;
				const commands = [
					`cd ${temporaryDirectoryPath}`,
					`node ${this.npmPath} install --production`
				];
				this.exec(commands.join(";"), (error, stdout) => {
					this.status(`Dependencies installed: ${stdout}`);
					done(error);
				});
			},
			(done) => {
				const temporaryDirectoryPath = parameters.temporaryDirectoryPath;
				const packagesZip = archiver("zip", {});
				const nodeModulesGlob = `${temporaryDirectoryPath}/node_modules/**/*`;

				this.status(`Adding files to package zip: ${nodeModulesGlob}`);

				glob(nodeModulesGlob, { dot: true }, (error, filePaths) => {
					this.status(`Number of files found with glob: ${filePaths.length}`);
					filePaths.forEach((filePath) => {
						const isDirectory = this.fileSystem.statSync(filePath).isDirectory();
						if (!isDirectory) {
							const fileBuffer = this.fileSystem.readFileSync(filePath);

							//const fileReadStream = this.fileSystem.createReadStream(filePath);
							const relativeFilePath = path.relative(`${temporaryDirectoryPath}/node_modules/`, filePath).replace(temporaryDirectoryPath, "");
							//this.status(`Adding "${filePath}" as "${relativeFilePath}"`);
							packagesZip.append(fileBuffer, { name: relativeFilePath } );
						}
					});
					this.status(`Done adding files to package zip.`);

					const zipFileWriteStream = this.fileSystem.createWriteStream(`${temporaryDirectoryPath}/package.zip`);

					zipFileWriteStream.on("close", () => {
						this.status(`Finished saving package zip`);
						done(null);
					});

					packagesZip.pipe(zipFileWriteStream);
					packagesZip.finalize();
				});
			},
			(done) => {
				if (event.region && event.bucket) {
					const temporaryDirectoryPath = parameters.temporaryDirectoryPath;
					const version = event.package.version;
					const s3 = new this.AWS.S3({ region: event.region });

					const packageZipFilePath = `${temporaryDirectoryPath}/package.zip`;

					const packageZipReadBuffer = this.fileSystem.readFileSync(packageZipFilePath);

					const fileName = `${event.package.name}-${version}.zip`;

					parameters.fileName = fileName;

					this.status(`Saving package zip to S3 as: ${event.bucket}/${fileName}`);

					s3.putObject({
						Bucket: event.bucket,
						Key: fileName,
						Body: packageZipReadBuffer
					}, (...options) => {
						this.status(`Finished saving package zip to S3 as: ${event.bucket}/${fileName}`);
						done(...options);
					});
				} else {
					this.status(`Region or Bucket not set: ${event.region} - ${event.bucket}`);
					done();
				}
			},
			(done) => {
				if (context.localFilePath) {
					const temporaryDirectoryPath = parameters.temporaryDirectoryPath;
					const packageZipFilePath = `${temporaryDirectoryPath}/package.zip`;
					fileSystem.copy(packageZipFilePath, context.localFilePath, done);
				} else {
					this.status(`No local file path set.`);
					done();
				}
			}
		], (error) => {
			if (error) {
				this.status(`There was an error! ${error}`);
				context.fail(error);
			} else {
				this.status(`SUCCESS! ${parameters.fileName}`);
				context.succeed({
					fileName: parameters.fileName
				});
			}
		});

		this.status(`End of .invoke()`);
	}
}
