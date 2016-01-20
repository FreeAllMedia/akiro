import sinon from "sinon";
import { exec } from "child_process";
// import fileSystem from "fs-extra";

export default function createMockExec(commandsAndCallbacks) {
	return sinon.spy((command, commandDone) => {

		let match = false;
		let callback;
		for (let commandString in commandsAndCallbacks) {
			const commandRegExp = new RegExp(commandString);
			if (command.match(commandRegExp)) {
				match = true;
				callback = commandsAndCallbacks[commandString];
			}
		}

		if (match) {
			callback(commandDone);
		} else {
			callback = commandsAndCallbacks[command];
			if (callback) {
				callback(commandDone);
			} else {
				unmockedCommand(command, commandDone);
			}
		}
	});
}

function unmockedCommand(command, done) {
	console.log("Unmocked command:", command);
	exec(command, done);
}
