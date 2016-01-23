import Akiro from "../lib/akiro.js";
import Conan from "conan";
import temp from "temp";
import { exec } from "child_process";
import AWS from "aws-sdk";
import Async from "flowsync";

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

	describe("akiro.temp", () => {
		describe("(When akiro.config.temp is set)", () => {
			it("should set akiro.temp to akiro.config.temp", () => {
				const mockTemp = {
					track: () => {}
				};
				config = {
					temp: mockTemp
				};
				akiro = new Akiro(config);
				akiro.temp.should.eql(mockTemp);
			});
		});
		describe("(When akiro.config.temp is NOT set)", () => {
			it("should set akiro.temp to the temp package", () => {
				akiro.temp.should.eql(temp);
			});
		});
	});

	describe("akiro.AWS", () => {
		describe("(When akiro.config.AWS is set)", () => {
			it("should set akiro.AWS to akiro.config.AWS", () => {
				const mockAWS = {};
				config = {
					AWS: mockAWS
				};
				akiro = new Akiro(config);
				akiro.AWS.should.eql(mockAWS);
			});
		});
		describe("(When akiro.config.AWS is NOT set)", () => {
			it("should set akiro.AWS to the AWS package", () => {
				akiro.AWS.should.eql(AWS);
			});
		});
	});

	describe("akiro.Async", () => {
		describe("(When akiro.config.Async is set)", () => {
			it("should set akiro.Async to akiro.config.Async", () => {
				const mockAsync = {};
				config = {
					Async: mockAsync
				};
				akiro = new Akiro(config);
				akiro.Async.should.eql(mockAsync);
			});
		});
		describe("(When akiro.config.Async is NOT set)", () => {
			it("should set akiro.Async to the Async package", () => {
				akiro.Async.should.eql(Async);
			});
		});
	});

	describe("akiro.exec", () => {
		describe("(When akiro.config.exec is set)", () => {
			it("should set akiro.exec to akiro.config.exec", () => {
				const mockExec = {};
				config = {
					exec: mockExec
				};
				akiro = new Akiro(config);
				akiro.exec.should.eql(mockExec);
			});
		});
		describe("(When akiro.config.exec is NOT set)", () => {
			it("should set akiro.exec to the exec package", () => {
				akiro.exec.should.eql(exec);
			});
		});
	});

	describe("akiro.cacheDirectoryPath", () => {
		describe("(When akiro.config.cacheDirectoryPath is set)", () => {
			it("should set akiro.cacheDirectoryPath to akiro.config.cacheDirectoryPath", () => {
				config = {
					cacheDirectoryPath: "./.somethingElse/"
				};
				akiro = new Akiro(config);
				akiro.cacheDirectoryPath.should.eql(config.cacheDirectoryPath);
			});
		});

		describe("(When akiro.config.cacheDirectoryPath is NOT set)", () => {
			it("should set akiro.cacheDirectoryPath to the cacheDirectoryPath package", () => {
				akiro.cacheDirectoryPath.should.eql("./.akiro/cache");
			});
		});
	});
});
