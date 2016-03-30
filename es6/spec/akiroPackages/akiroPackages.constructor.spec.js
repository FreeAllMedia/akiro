import AkiroPackages from "../../lib/akiroPackages/akiroPackages.js";

describe("AkiroPackages()", () => {
	let akiroPackages,
			requestedPackages;

	beforeEach(() => {
		requestedPackages = {
			"async": "1.0.0"
		};
		akiroPackages = new AkiroPackages(requestedPackages);
	});

	it("should instantiate an instance of AkiroPackages", () => {
		akiroPackages.should.be.instanceOf(AkiroPackages);
	});

	it("should set the requested packages to .requestedPackages()", () => {
		akiroPackages.requestedPackages().should.eql(requestedPackages);
	});
});
