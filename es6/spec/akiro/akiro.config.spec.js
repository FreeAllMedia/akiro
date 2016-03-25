import Akiro from "../../lib/akiro/akiro.js";
import MockConan from "../helpers/mockConan.js";

describe("akiro.config", () => {
	let akiro,
			config;

	beforeEach(() => {
		config = {
			bucket: "my-bucket-name",
			region: "us-east-1",
			role: "MyIAmRole",
			temporaryDirectoryPath: "/temp/path",
			Conan: MockConan
		};

		akiro = new Akiro(config);
	});

	it("should save config.bucket to .bucket()", () => {
		akiro.bucket().should.eql(config.bucket);
	});

	it("should save config.region to .region()", () => {
		akiro.region().should.eql(config.region);
	});

	it("should save config.role to .role()", () => {
		akiro.role().should.eql(config.role);
	});

	it("should instantiate conan from config.Conan", () => {
		akiro.conan.should.be.instanceOf(MockConan);
	});

	it("should save temporaryDirectoryPath to .temporaryDirectoryPath()", () => {
		akiro.temporaryDirectoryPath().should.eql(config.temporaryDirectoryPath);
	});
});
