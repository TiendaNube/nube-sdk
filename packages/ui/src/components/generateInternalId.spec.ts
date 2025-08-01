import { beforeAll, describe, expect, it } from "vitest";
import { generateInternalId } from "./generateInternalId";

describe("generateInternalId", () => {
	it("should generate a stable ID for the same props", () => {
		const props1 = { children: "test", width: "100%" };
		const props2 = { children: "test", width: "100%" };

		const id1 = generateInternalId("box", props1);
		const id2 = generateInternalId("box", props2);

		expect(id1).toBe(id2);
		expect(id1).toContain("box-test-app-id-");
	});

	it("should generate different IDs for different props", () => {
		const props1 = { children: "test", width: "100%" };
		const props2 = { children: "test", width: "50%" };

		const id1 = generateInternalId("box", props1);
		const id2 = generateInternalId("box", props2);

		expect(id1).not.toBe(id2);
	});

	it("should generate different IDs for different component types", () => {
		const props = { children: "test" };

		const boxId = generateInternalId("box", props);
		const textId = generateInternalId("txt", props);

		expect(boxId).not.toBe(textId);
		expect(boxId).toContain("box-test-app-id-");
		expect(textId).toContain("txt-test-app-id-");
	});

	it("should handle empty props", () => {
		const props = {};
		const id = generateInternalId("box", props);

		expect(id).toContain("box-test-app-id-");
		expect(id).toMatch(/^box-test-app-id-[a-z0-9]+$/);
	});

	it("should handle props with functions (should be ignored)", () => {
		const props1 = {
			children: "test",
			onClick: () => console.log("click"),
		};
		const props2 = {
			children: "test",
			onClick: () => console.log("different click"),
		};

		const id1 = generateInternalId("button", props1);
		const id2 = generateInternalId("button", props2);

		// IDs should be the same because functions are ignored
		expect(id1).toBe(id2);
	});

	it("should use memoization for the same props object", () => {
		const props = { children: "test" };

		const id1 = generateInternalId("box", props);
		const id2 = generateInternalId("box", props);

		expect(id1).toBe(id2);
	});
});
