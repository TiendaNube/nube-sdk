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

	it("should handle non-string children props (arrays, objects, etc.)", () => {
		const propsWithArrayChildren = {
			children: ["item1", "item2"],
			width: "100%",
		};
		const propsWithObjectChildren = {
			children: { type: "element", value: "test" },
			width: "100%",
		};
		const propsWithNumberChildren = {
			children: 42,
			width: "100%",
		};

		const id1 = generateInternalId("box", propsWithArrayChildren);
		const id2 = generateInternalId("box", propsWithObjectChildren);
		const id3 = generateInternalId("box", propsWithNumberChildren);

		// All should generate the same ID because non-string children are normalized to "[children]"
		expect(id1).toBe(id2);
		expect(id2).toBe(id3);
		expect(id1).toContain("box-test-app-id-");
	});

	describe("should reuse valid internal IDs", () => {
		it("should return the same ID when a valid __internalId is provided", () => {
			const validId = "box-test-app-id-abc123";
			const props = {
				__internalId: validId,
				children: "test",
				width: "100%",
			};

			const result = generateInternalId("box", props);
			expect(result).toBe(validId);
		});

		it("should ignore invalid __internalId and generate a new one", () => {
			const invalidId = "invalid-id-format";
			const props = {
				__internalId: invalidId,
				children: "test",
				width: "100%",
			};

			const result = generateInternalId("box", props);
			expect(result).not.toBe(invalidId);
			expect(result).toContain("box-test-app-id-");
			expect(result).toMatch(/^box-test-app-id-[a-z0-9]+$/);
		});

		it("should ignore empty string __internalId and generate a new one", () => {
			const props = {
				__internalId: "",
				children: "test",
				width: "100%",
			};

			const result = generateInternalId("box", props);
			expect(result).toContain("box-test-app-id-");
			expect(result).toMatch(/^box-test-app-id-[a-z0-9]+$/);
		});

		it("should ignore non-string __internalId and generate a new one", () => {
			const props = {
				__internalId: 123,
				children: "test",
				width: "100%",
			};

			const result = generateInternalId("box", props);
			expect(result).toContain("box-test-app-id-");
			expect(result).toMatch(/^box-test-app-id-[a-z0-9]+$/);
		});

		it("should ignore __internalId with wrong app ID and generate a new one", () => {
			const wrongAppId = "box-wrong-app-id-abc123";
			const props = {
				__internalId: wrongAppId,
				children: "test",
				width: "100%",
			};

			const result = generateInternalId("box", props);
			expect(result).not.toBe(wrongAppId);
			expect(result).toContain("box-test-app-id-");
			expect(result).toMatch(/^box-test-app-id-[a-z0-9]+$/);
		});
	});
});
