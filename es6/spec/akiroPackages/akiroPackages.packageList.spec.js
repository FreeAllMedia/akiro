import AkiroPackages from "../../lib/akiroPackages/akiroPackages.js";
import AkiroPackage from "../../lib/akiroPackage/akiroPackage.js";

describe("akiroPackages.packageList", () => {
	let akiroPackages,
			requestedPackages;

	beforeEach(() => {
		requestedPackages = {
			"async": "1.0.0"
		};
		akiroPackages = new AkiroPackages(requestedPackages);
	});

	it("should add packages by name", () => {
		akiroPackages.packageList.should.have.property("async");
	});

	it("should contain instances of AkiroPackage", () => {
		const akiroPackage = akiroPackages.packageList.async;
		akiroPackage.should.be.instanceOf(AkiroPackage);
	});
});
