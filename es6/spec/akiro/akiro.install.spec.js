import Akiro from "../../lib/akiro/akiro.js";
import glob from "glob";
import temp from "temp";
import packageJSON from "../../../package.json";
import path from "path";
import MockConan from "../helpers/mockConan.js";

describe("akiro.install()", () => {
	let akiro,
			temporaryDirectoryPath;

	beforeEach(done => {
		temporaryDirectoryPath = temp.mkdirSync("akiro.install");

		akiro = new Akiro({
			temporaryDirectoryPath: temporaryDirectoryPath,
			libraries: {
				conan: MockConan
			}
		});

		akiro.install(done);
	});

	it("should build its own dependencies in a temp directory", () => {
		const dependencyFileNames = glob.sync(`${temporaryDirectoryPath}/*`).map((dependencyPath) => {
			return dependencyPath.replace(`${temporaryDirectoryPath}/`, "");
		});

		const builderDependencies = packageJSON.builderDependencies;

		const expectedModuleFileNames = [];

		for (let dependencyName in builderDependencies) {
			expectedModuleFileNames.push(`node_modules/${dependencyName}`);
		}

		dependencyFileNames.should.contain.members(expectedModuleFileNames);
	});

	it("should include akiroBuilder and dependencies in the lambda", () => {
		let dependencyPaths = [
			[path.normalize(`${__dirname}/../../lib/akiro/builders/nodejs/akiroBuilder.js`)],
			[`${temporaryDirectoryPath}/node_modules/**/*`, {
				zipPath: "/node_modules/",
				basePath: `${temporaryDirectoryPath}/node_modules/`
			}]
		];

		akiro.lambda.dependencies().should.eql(dependencyPaths);
	});

	xit("should be deployed to AWS", () => {
		mockConan.deploy.calledWith(callback).should.be.true;
	});
});
