import Akiro from "akiro";
const akiro = new Akiro();

const packageDependencies = {
	"ffmpeg": "1.5.0",
	"flowsync": "^0.1.12",
	"almaden": "^0.3.1",
	"dovima": "^0.3.2",
	"incognito": "^0.1.4"
};

akiro
	.region("us-east-1")
	.bucket("my-akiro-bucket")
	.packages(packageDependencies)
		.package("ffmpeg")
			.runScript(ffMpegBuildScript)
			.includeBinaries("ffmpeg", "mp32wav") // which ffmpeg
				.basePath("/blah/")
				.zipPath("somedir/")
			.includeFiles("/home/akiro/something/**/*", "/home/somethingElse/**/*")
				.basePath("something")
				.zipPath("somethingElse");

const outputDirectory = `${process.cwd()}/node_modules_aws/`;

akiro.build(packageDependencies, outputDirectory, (packageError) => {
	if (packageError) { throw packageError; }
	console.log("Voila!", `ls -lah ${outputDirectory}`);
});
