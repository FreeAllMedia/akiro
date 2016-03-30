import Akiro from "../../lib/akiro/akiro.js";
import NpmPackageBuilder from "../../lib/npmPackageBuilder/npmPackageBuilder.js";

describe("akiro.npmPackageBuilder()", () => {
	let akiro;

	beforeEach(() => {
		akiro = new Akiro();
	});

	it("should instantiate npmPackageBuilder from NpmPackageBuilder by default", () => {
		akiro.npmPackageBuilder.should.be.instanceOf(NpmPackageBuilder);
	});
});
