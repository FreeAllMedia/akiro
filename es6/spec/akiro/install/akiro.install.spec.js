import Akiro from "../../../lib/akiro/akiro.js";
import glob from "glob";
import temp from "temp";

describe("akiro.install()", () => {
	let akiro,
			temporaryDirectoryPath;

	beforeEach(() => {
		temporaryDirectoryPath = temp.mkdirSync("akiro.install");
		akiro = new Akiro();
	});

	xit("should build its own dependencies in a temp directory", () => {
		const dependencyFileNames = glob.sync(`${temporaryDirectoryPath}/**/*`).map((dependencyPath) => {
			return dependencyPath.replace(`${temporaryDirectoryPath}/`, "");
		});

		dependencyFileNames.should.contain.members([
			"node_modules/async",
			"node_modules/incognito"
		]);
	});

	xit("should include akiroBuilder and dependencies in the temp directory", () => {
		let dependencyPaths = [
			[path.normalize(`${__dirname}/../../lib/akiro/builders/nodejs/akiroBuilder.js`)],
			[`${temporaryDirectoryPath}/node_modules/**/*`, {
				zipPath: "/node_modules/",
				basePath: `${temporaryDirectoryPath}/node_modules/`
			}]
		];

		mockConanLambda.dependencies().should.eql(dependencyPaths);
	});

	xit("should be deployed to AWS", () => {
		mockConan.deploy.calledWith(callback).should.be.true;
	});
});
