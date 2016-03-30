import NpmPackageBuilder from "../../lib/npmPackageBuilder/npmPackageBuilder.js";
import temp from "temp";

describe("NpmPackageBuilder.constructor()", () => {
	let npmPackageBuilder,
			packageList,
			outputDirectoryPath,
			configuration;

	beforeEach(() => {
		packageList = {
			"async": "1.0.0"
		};
		configuration = {
			basePath: "/some/base/path"
		};
		outputDirectoryPath = temp.mkdirSync("NpmPackageBuilder.constructor");
		npmPackageBuilder = new NpmPackageBuilder(packageList, outputDirectoryPath, configuration);
	});

	it("should return an instance of NpmPackageBuilder", () => {
		npmPackageBuilder.should.be.instanceOf(NpmPackageBuilder);
	});

	it("should save the provided package list to .packageList", () => {
		npmPackageBuilder.packageList().should.eql(packageList);
	});

	it("should save the provided output directory to .outputDirectoryPath", () => {
		npmPackageBuilder.outputDirectoryPath().should.eql(outputDirectoryPath);
	});
});
