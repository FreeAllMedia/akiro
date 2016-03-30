import Akiro, { AkiroPackages } from "../../lib/akiro/akiro.js";

describe("akiro.packages()", () => {
	let akiro,
			requestedPackages;

	beforeEach(() => {
		akiro = new Akiro();
		requestedPackages = {
			"async": "1.0.0"
		};
	});

	it("should return an instance of AkiroPackages", () => {
		akiro.packages().should.be.instanceOf(AkiroPackages);
	});

	it("should pass the designated packages to the AkiroPackages instance", () => {
		const akiroPackages = akiro.packages(requestedPackages);
		akiroPackages.requestedPackages().should.eql(requestedPackages);
	});
});
