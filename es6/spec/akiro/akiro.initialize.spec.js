import Akiro from "../../lib/akiro.js";
import MockAWS from "../helpers/mockAws.js";

describe("akiro.initialize(callback)", () => {
	let config,
			akiro,
			callback,

			roleName;

	beforeEach(done => {
		MockAWS.reset();

		config = {
			AWS: MockAWS
		};

		akiro = new Akiro(config);

		akiro.initialize(done);
	});

	it("should create an Akiro Builder lambda function on AWS");
});
