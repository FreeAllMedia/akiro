import AkiroPackages from "../../lib/akiroPackages/akiroPackages.js";
import AkiroPackage from "../../lib/akiroPackage/akiroPackage.js";

describe("akiroPackages.newPackage()", () => {
	let akiroPackages,
			newPackage,
			packageName,
			packageVersion;

	beforeEach(() => {
		akiroPackages = new AkiroPackages();

		packageName = "async";
		packageVersion = "1.0.0";
		newPackage = akiroPackages.newPackage(packageName, packageVersion);
	});

	it("should return an instance of AkiroPackage", () => {
		newPackage.should.be.instanceOf(AkiroPackage);
	});

	it("should return the package name", () => {
		newPackage.name().should.eql(packageName);
	});

	it("should return the package version", () => {
		newPackage.version().should.eql(packageVersion);
	});
});
