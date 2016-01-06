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

	describe(".config", () => {
		it("should return the config object provided to the constructor", () => {
			akiro.config.should.eql(config);
		});

		it("should be read-only", () => {
			() => {
				akiro.config = 123;
			}.should.throw();
		});
	});
});
