import Akiro from "../../lib/akiro/akiro.js";
import MockConan from "../helpers/mockConan.js";
import MockNpmPackageBuilder from "../helpers/mockNpmPackageBuilder.js";

describe("akiro.config", () => {
	let akiro,
			config;

	beforeEach(() => {
		config = {
			bucket: "my-bucket-name",
			region: "us-east-1",
			role: "MyIAmRole",
			temporaryDirectoryPath: "/temp/path",
			builderDependencies: {
				"async": "1.0.0"
			},
			libraries: {
				conan: MockConan,
				npmPackageBuilder: MockNpmPackageBuilder
			}
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

	it("should save builderDependencies to .builderDependencies()", () => {
		akiro.builderDependencies().should.eql(config.builderDependencies);
	});

	it("should instantiate conan from config.libraries.conan", () => {
		akiro.conan.should.be.instanceOf(MockConan);
	});

	it("should instantiate npmPackageBuilder from config.libraries.npmPackageBuilder", () => {
		akiro.npmPackageBuilder.should.be.instanceOf(MockNpmPackageBuilder);
	});

	it("should save temporaryDirectoryPath to .temporaryDirectoryPath()", () => {
		akiro.temporaryDirectoryPath().should.eql(config.temporaryDirectoryPath);
	});
});
