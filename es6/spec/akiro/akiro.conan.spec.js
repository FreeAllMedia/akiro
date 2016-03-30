import Akiro from "../../lib/akiro/akiro.js";
import MockConan from "../helpers/mockConan.js";
import Conan from "conan";
import ConanAwsLambda from "conan-aws-lambda";

describe("akiro.conan", () => {
	let akiro;

	beforeEach(() => {
		akiro = new Akiro({
			libraries: {
				conan: MockConan
			}
		});
	});

	it("should instantiate .conan from Conan by default", () => {
		akiro = new Akiro();
		akiro.conan.should.be.instanceOf(Conan);
	});

	it("should use the conan-aws-lambda plugin", () => {
		akiro.conan.use.calledWith(ConanAwsLambda).should.be.true;
	});
});
