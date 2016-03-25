import Akiro from "../../lib/akiro/akiro.js";

describe("akiro.role()", () => {
	let akiro;

	beforeEach(() => {
		akiro = new Akiro();
	});

	it("should set and get the role", () => {
		const role = "MyRoleName";
		akiro.role(role);
		akiro.role().should.eql(role);
	});
});
