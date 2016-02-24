import sinon from "sinon";

export default function createMockTemp(temporaryDirectoryPath) {
	return {
		mkdir: sinon.spy((directoryName, callback) => {
			callback(null, temporaryDirectoryPath);
		})
	};
}
