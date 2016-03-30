import sinon from "sinon";
import { execSync } from "child_process";
// import fileSystem from "fs-extra";

export default function createMockExecSync(commandsAndValues) {
	return sinon.spy(command => {
		let match = false;
		let value;
		for (let commandString in commandsAndValues) {
			const commandRegExp = new RegExp(commandString);
			if (command.match(commandRegExp)) {
				match = true;
				value = commandsAndValues[commandString];
			}
		}

		let returnValue;

		if (match) {
			returnValue = value;
		} else {
			value = commandsAndValues[command];
			if (value) {
				returnValue = value;
			} else {
				unmockedCommand(command);
			}
		}

		return returnValue;
	});
}

function unmockedCommand(command) {
	/* eslint-disable no-console */
	console.log("Unmocked command:", command);
	return execSync(command);
}
