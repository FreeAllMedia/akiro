import Akiro from "../lib/akiro.js";
import Conan from "conan";

describe("Akiro(config)", () => {
	let akiro,
			config,

			conan;

	beforeEach(() => {
		config = {};

		akiro = new Akiro(config);
	});

	it("should not require a config object", () => {
		() => {
			akiro = new Akiro();
		}.should.not.throw();
	});

	describe("akiro.conan", () => {
		describe("(When akiro.config.conan is set)", () => {
			it("should set akiro.conan to akiro.config.conan", () => {
				conan = new Conan();
				config = {
					conan: conan
				};
				akiro = new Akiro(config);
				akiro.conan.should.eql(conan);
			});
		});
		describe("(When akiro.config.conan is NOT set)", () => {
			it("should set akiro.conan to a new instance of Conan", () => {
				akiro.conan.should.be.instanceOf(Conan);
			});
		});
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

	describe("akiro.config.region", () => {
		it("should default to 'us-east-1'", () => {
			akiro.config.region.should.eql("us-east-1");
		});
		it("should be used by Conan", () => {
			akiro.conan.config.region.should.eql("us-east-1");
		});
	});
});
