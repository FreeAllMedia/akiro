import privateData from "../../";

class Cup {
	constructor() {
		privateData(this).content = "wine";
	}

	getContent() {
		return privateData(this).content;
	}

	clean() {
		privateData(this).content = null;
	}
}

class Glass {
	constructor() {
		privateData(this).content = "water";
	}

	getContent() {
		return privateData(this).content;
	}
}

describe("Incognito", () => {
	let cup, glass;

	before(() => {
		cup = new Cup();
		glass = new Glass();
	});

	it("should provide a private context for a Cup example class that has private content", () => {
		cup.getContent().should.equal("wine");
	});

	it("should not interfer other classes", () => {
		glass.getContent().should.equal("water");
	});

	it("should not interfer other instances of the same class", () => {
		let secondCup = new Cup();
		cup.clean();
		secondCup.getContent().should.equal("wine");
	});
});
