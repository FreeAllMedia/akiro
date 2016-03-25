import Akiro from "../../lib/akiro/akiro.js";

describe("Akiro()", () => {
	let akiro;

	beforeEach(() => {
		akiro = new Akiro();
	});

	it("should instantiate an instance of Akiro", () => {
		akiro.should.be.instanceOf(Akiro);
	});
});
