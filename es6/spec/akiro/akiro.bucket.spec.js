import Akiro from "../../lib/akiro/akiro.js";

describe("akiro.bucket()", () => {
	let akiro;

	beforeEach(() => {
		akiro = new Akiro();
	});

	it("should set and get the bucket", () => {
		const bucket = "my-bucket-name";
		akiro.bucket(bucket);
		akiro.bucket().should.eql(bucket);
	});
});
