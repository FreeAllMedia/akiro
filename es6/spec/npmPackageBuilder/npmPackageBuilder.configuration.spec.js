import NpmPackageBuilder from "../../lib/npmPackageBuilder/npmPackageBuilder.js";
import temp from "temp";
import path from "path";

describe("NpmPackageBuilder.constructor()", () => {
	let npmPackageBuilder,
			packageList,
			outputDirectoryPath,
			configuration,
			mockExec;

	beforeEach(() => {
		packageList = {
			"async": "1.0.0"
		};

		mockExec = {
			foo: "bar"
		};

		outputDirectoryPath = temp.mkdirSync("npmPackageBuilder.configuration");
	});

	describe("(With No Configuration Options Set)", () => {
		beforeEach(() => {
			npmPackageBuilder = new NpmPackageBuilder(packageList, outputDirectoryPath);
		});

		it("should set the npmPath to the package's npm copy by default", () => {
			const defaultNpmPath = path.normalize(`${__dirname}/../../../node_modules/npm/bin/npm-cli.js`);
			npmPackageBuilder.npmPath().should.eql(defaultNpmPath);
		});
	});

	describe("(With Configuration Options Set)", () => {
		beforeEach(() => {
			configuration = {
				basePath: "/some/base/path",
				npmPath: "/some/npm/path",
				libraries: {
					exec: mockExec
				}
			};

			npmPackageBuilder = new NpmPackageBuilder(packageList, outputDirectoryPath, configuration);
		});

		it("should save the basePath from configuration", () => {
			npmPackageBuilder.basePath().should.eql(configuration.basePath);
		});

		it("should save the exec from configuration", () => {
			npmPackageBuilder.libraries.exec.should.eql(configuration.libraries.exec);
		});

		it("should save the npmPath from configuration", () => {
			npmPackageBuilder.npmPath().should.eql(configuration.npmPath);
		});
	});
});
