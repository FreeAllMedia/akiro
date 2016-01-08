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
});
