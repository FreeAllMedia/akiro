import Akiro from "../../lib/akiro/akiro.js";

describe("akiro.temporaryDirectoryPath", () => {
	let akiro;

	beforeEach(() => {
		akiro = new Akiro();
	});

	it("should create a temporaryDirectoryPath by default", () => {
		(akiro.temporaryDirectoryPath() === undefined).should.not.be.true;
	});
});
