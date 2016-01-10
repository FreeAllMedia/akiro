import Akiro from "../lib/akiro.js";

describe("Akiro(config)", () => {
	let akiro,
			config;

	before(() => {
		config = {
			branch: "someBranch"
		};
		akiro = new Akiro(config);
	});

	describe("akiro.config", () => {
		it("should return the supplied config object", () => {
			akiro.config.should.eql(config);
		});

		it("should be read-only", () => {
			() => {
				akiro.config = { new: "config" };
			}.should.throw();
		});
	});
});
