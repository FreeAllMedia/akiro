import Akiro from "../../lib/akiro/akiro.js";

describe("akiro.region()", () => {
	let akiro;

	beforeEach(() => {
		akiro = new Akiro();
	});

	it("should set and get the region", () => {
		const region = "us-east-1";
		akiro.region(region);
		akiro.region().should.eql(region);
	});
});
