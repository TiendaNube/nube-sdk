import { describe, expect, it } from "vitest";
import { box } from "./box";

describe("box", () => {
	it("should prefix className with the app id", () => {
		expect(box({ className: "teste" }).className).toBe("app-test-app-id_teste");
	});

	it("should prefix each class in className", () => {
		expect(box({ className: " foo  bar " }).className).toBe(
			"app-test-app-id_foo app-test-app-id_bar",
		);
	});

	it("should not prefix a class twice", () => {
		const first = box({ className: "teste" });
		expect(box({ className: first.className }).className).toBe(
			"app-test-app-id_teste",
		);
	});

	it("should not add className when not provided", () => {
		expect(box({})).not.toHaveProperty("className");
	});
});
