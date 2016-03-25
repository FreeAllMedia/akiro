import Akiro, { AkiroPackages } from "../../lib/akiro/akiro.js";

describe("akiro.packages()", () => {
	let akiro,
			packages;

	beforeEach(() => {
		akiro = new Akiro();
		packages = {
			"async": "1.0.0"
		};
	});

	it("should return an instance of AkiroPackages", () => {
		akiro.packages().should.be.instanceOf(AkiroPackages);
	});

	it("should return an instance of AkiroPackages", () => {
		const akiroPackages = akiro.packages(packages);
		akiroPackages.packages().should.eql(packages);
	});
});
