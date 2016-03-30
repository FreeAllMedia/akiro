import AkiroPackages from "../../lib/akiroPackages/akiroPackages.js";
import AkiroPackage from "../../lib/akiroPackage/akiroPackage.js";

describe("akiroPackages.package()", () => {
	let akiroPackages,
			packageList,
			specificPackage;

	beforeEach(() => {
		packageList = {
			"async": "1.0.0"
		};
		akiroPackages = new AkiroPackages(packageList);
		specificPackage = akiroPackages.package("async");
	});

	it("should return an instance of AkiroPackage", () => {
		specificPackage.should.be.instanceOf(AkiroPackage);
	});

	it("should return a package by name", () => {
		specificPackage.name().should.eql("async");
	});
});
