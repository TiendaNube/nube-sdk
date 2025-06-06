import { describe, it, expect } from "vitest";
import { ThemeColor } from "./ThemeColor";

describe("ThemeColor", () => {
	describe("toValue", () => {
		it("should return the correct CSS variable for the token", () => {
			const color = new ThemeColor("primary");
			expect(color.toValue()).toBe("var(--primary)");
		});

		it("should handle different token names", () => {
			const color = new ThemeColor("background");
			expect(color.toValue()).toBe("var(--background)");
		});
	});

	describe("toString", () => {
		it("should return the same string as toValue", () => {
			const color = new ThemeColor("primary");
			expect(color.toString()).toBe(color.toValue());
		});
	});

	describe("opacity", () => {
		it("should return the correct CSS variable with opacity", () => {
			const color = new ThemeColor("primary");
			expect(color.opacity(50)).toBe("var(--primary-opacity-50)");
		});

		it("should pad single digit opacity values with leading zero", () => {
			const color = new ThemeColor("primary");
			expect(color.opacity(5)).toBe("var(--primary-opacity-05)");
		});

		it("should handle different token names with opacity", () => {
			const color = new ThemeColor("background");
			expect(color.opacity(80)).toBe("var(--background-opacity-80)");
		});

		it("should handle minimum opacity value", () => {
			const color = new ThemeColor("primary");
			expect(color.opacity(0)).toBe("var(--primary-opacity-00)");
		});

		it("should handle maximum opacity value", () => {
			const color = new ThemeColor("primary");
			expect(color.opacity(90)).toBe("var(--primary-opacity-90)");
		});
	});
});
