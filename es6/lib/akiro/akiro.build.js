import fileSystem from "fs";
import archiver from "archiver";

export default function build(filePath, callback) {
	const zipData = archiver.create("zip", {});

	const lambdaData = fileSystem.createReadStream(__dirname + "/packagers/nodejs/akiro.packager.nodejs.js");

	zipData.append(lambdaData, { name: "lambda.js" });

	const zipFile = fileSystem.createWriteStream(filePath);
	zipFile.on("close", () => {
		callback();
	});

	zipData.pipe(zipFile);
	zipData.finalize();
}
