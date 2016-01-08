import Akiro from "../../lib/akiro.js";
import sinon from "sinon";
import MockAWS from "../helpers/mockAws.js";

describe("akiro.package(packageList, [localZipFilePath,] callback)", () => {
	let bucketName,
			config,
			akiro,

			callback;

	beforeEach(() => {
		bucketName = "SomeBucket";

		MockAWS.reset();

		config = {
			AWS: MockAWS,
			bucket: bucketName
		};

		akiro = new Akiro(config);

		akiro.package
	});

	it("should invoke the Akiro lambda function on AWS", () => {
		
	});

	describe("(When localZipFilePath is provided)", () => {
		it("should download the package zip file to the local path provided");
		it("should include all designated packages in the zip file");
	});

	describe("(When localZipFilePath is NOT provided)", () => {
		it("should return the remote package zip file url via the return data");
		it("should include all designated packages in the zip file");
	});
});
