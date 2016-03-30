import NpmPackageBuilder from "../../lib/npmPackageBuilder/npmPackageBuilder.js";
import temp from "temp";
import { exec } from "child_process";

describe("npmPackageBuilder.libraries", () => {
	let npmPackageBuilder,
			packageList,
			outputDirectoryPath;

	beforeEach(() => {
		packageList = {
			"async": "1.0.0"
		};
		outputDirectoryPath = temp.mkdirSync("npmPackageBuilder.libraries");
		npmPackageBuilder = new NpmPackageBuilder(packageList, outputDirectoryPath);
	});

	it("should have a libraries object containing exec", () => {
		npmPackageBuilder.libraries.exec.should.eql(exec);
	});
});
