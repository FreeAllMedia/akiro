import Akiro from "../../lib/akiro/akiro.js";
import MockConan from "../helpers/mockConan.js";
import packageJson from "../../../package.json";

describe("akiro.conan", () => {
	let akiro;

	beforeEach(() => {
		akiro = new Akiro({
			libraries: {
				conan: MockConan
			}
		});
	});

	it("should set .builderDependencies to package.json's builderDependencies by default", () => {
		akiro.builderDependencies().should.eql(packageJson.builderDependencies);
	});
});
