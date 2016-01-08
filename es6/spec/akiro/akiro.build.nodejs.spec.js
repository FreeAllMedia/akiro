import Akiro from "../../lib/akiro.js";
import temp from "temp";
import fileSystem from "fs";
import unzip from "unzip2";
import stream from "stream";

describe("akiro.build(filePath, callback)", () => {
	let akiro,
			filePath;

	beforeEach(done => {
		temp.track();

		const config = {};

		akiro = new Akiro(config);

		temp.mkdir("akiro_build", (error, tempDirectoryPath) => {
			filePath = `${tempDirectoryPath}/akiro.packager.zip`;
			akiro.build(filePath, done);
		});
	});

	afterEach(done => {
		temp.cleanup(done);
	});

	it("should build an Akiro Packager zip file", () => {
		fileSystem.existsSync(filePath).should.be.true;
	});

	describe("(Zip File)", () => {
		/* eslint-disable new-cap */
		let files,
				filePaths,

				lambdaFilePath,
				lambdaFile;

		beforeEach(done => {
			lambdaFilePath = __dirname + "/../../lib/akiro/packagers/nodejs/akiro.packager.nodejs.js";

			files = [];

			fileSystem.createReadStream(filePath)
				.pipe(unzip.Parse())
				.on("entry", (entry) => {
					if (entry.path === "lambda.js") {
						lambdaFile = entry;
					}
					files.push(entry);
				})
				.on("close", () => {
					filePaths = files.map((file) => { return file.path; });
					done();
				});
		});

		it("should contain the Akiro Packager lambda", () => {
			filePaths.should.include("lambda.js");
		});

		it("should insert the correct data for Akiro Packager lambda", done => {
			/* eslint-disable new-cap */
			const lambdaFileData = fileSystem.readFileSync(lambdaFilePath);

			const Writable = stream.Writable;
			const writableStream = Writable({ objectMode: true });
			writableStream._write = (chunk) => {
				chunk.should.eql(lambdaFileData);
				done();
			};
			lambdaFile.pipe(writableStream);
		});

		xit("should contain all Akiro Packager dependencies", () => {
			filePaths.should.eql([
				"lambda.js"
			]);
		});
	});
});
