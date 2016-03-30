import Akiro from "../../lib/akiro/akiro.js";
import glob from "glob";
import temp from "temp";
import path from "path";
import packageJSON from "../../../package.json";
import MockConan from "../helpers/mockConan.js";
import MockNpmPackageBuilder from "../helpers/mockNpmPackageBuilder.js";

describe("akiro.install()", () => {
	let akiro,
			temporaryDirectoryPath,
			dependencyFilePaths,
			callback;

	beforeEach(done => {
		callback = done;
		temporaryDirectoryPath = temp.mkdirSync("akiro.install");

		akiro = new Akiro({
			temporaryDirectoryPath: temporaryDirectoryPath,
			libraries: {
				conan: MockConan,
				npmPackageBuilder: MockNpmPackageBuilder
			}
		});

		akiro.install(() => {
			dependencyFilePaths = glob.sync(`${temporaryDirectoryPath}/node_modules/*`);
			callback();
		});
	});

	it("should copy akiroBuilder and build its own dependencies into a temp directory", () => {
		const builderFilePaths = glob.sync(`${temporaryDirectoryPath}/*`, { nodir: true });

		const filePaths = Array.concat(builderFilePaths, dependencyFilePaths).map((dependencyPath) => {
			return dependencyPath.replace(`${temporaryDirectoryPath}/`, "");
		});

		const expectedBuilderFilePaths = [
			"akiroBuilder.js",
			"handler.js"
		];
		const expectedDependencyFilePaths = [];
		for (let dependencyName in packageJSON.builderDependencies) {
			expectedDependencyFilePaths.push(`node_modules/${dependencyName}`);
		}
		const expectedFilePaths = Array.concat(expectedBuilderFilePaths, expectedDependencyFilePaths);

		filePaths.should.contain.members(expectedFilePaths);
	});

	it("should include akiroBuilder and dependencies in the lambda", () => {
		dependencyFilePaths.push("akiroBuilder.js");
		akiro.lambda.dependencies().should.eql([[
			"**/*",
			{
				"basePath": temporaryDirectoryPath
			}
		]]);
	});

	it("should set the lambda filePath to the handler", () => {
		const handlerFilePath = path.normalize(`${__dirname}/../../lib/akiroBuilder/npm/handler.js`);
		akiro.lambda.filePath().should.eql(handlerFilePath);
	});

	it("should be deployed to AWS", () => {
		akiro.conan.deploy.called.should.be.true;
	});
});
