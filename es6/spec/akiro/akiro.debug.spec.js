import Akiro from "../../lib/akiro.js";

describe("Akiro(config)", () => {
	let akiro,
			config;

	beforeEach(() => {
		config = {
			debug: true
		};
		akiro = new Akiro(config);
	});

	it("should accept a debug config option for .package()", done => {
		akiro.package({}, "", done);
	});
});
