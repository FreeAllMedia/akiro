import NpmPackageBuilder from "../../lib/npmPackageBuilder/npmPackageBuilder.js";
import temp from "temp";
import fileSystem from "fs-extra";
import glob from "glob";
import packageJson from "../../../package.json";
import createMockExec from "../helpers/mockExec.js";
import path from "path";

describe("npmPackageBuilder.build()", () => {
	let npmPackageBuilder,
			temporaryDirectoryPath,
			packageList,
			outputDirectoryPath,
			configuration,
			nodeModulesDirectoryPath;

	beforeEach(done => {
		packageList = {
			"incognito": packageJson.builderDependencies.incognito
		};

		temporaryDirectoryPath = temp.mkdirSync("npmPackageBuilder.build.createDirectory");
		outputDirectoryPath = `${temporaryDirectoryPath}/my_directory`;

		nodeModulesDirectoryPath = path.normalize(`${__dirname}/../../../node_modules`);

		const mockCommands = {
			".*npm-cli\\.js install": (commandDone) => {
				const packageNames = Object.keys(packageList);
				packageNames.forEach(packageName => {
					fileSystem.copySync(`${nodeModulesDirectoryPath}/${packageName}`, `${outputDirectoryPath}/node_modules/${packageName}`);
				});
				commandDone();
			}
		};

		configuration = {
			libraries: {
				exec: createMockExec(mockCommands)
			}
		};

		npmPackageBuilder = new NpmPackageBuilder(packageList, outputDirectoryPath, configuration);
		npmPackageBuilder.build(done);
	});

	it("should return an instance of NpmPackageBuilder", () => {
		npmPackageBuilder.should.be.instanceOf(NpmPackageBuilder);
	});

	it("should create the outputDirectoryPath if it is not already created", () => {
		fileSystem.existsSync(outputDirectoryPath).should.be.true;
	});

	it("should build the requested packages in the designated output directory", () => {
		const dependencyFileNames = glob.sync(`${outputDirectoryPath}/*`).map((dependencyPath) => {
			return dependencyPath.replace(`${outputDirectoryPath}/`, "");
		});

		const expectedModuleFileNames = Object.keys(packageList);
		dependencyFileNames.should.contain.members(expectedModuleFileNames);
	});
});
