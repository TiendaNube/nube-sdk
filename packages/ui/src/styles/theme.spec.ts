import { describe, expect, it } from "vitest";
import { theme } from "./theme";

describe("theme", () => {
	it("should have ThemeColor instances with correct tokens", () => {
		expect(theme.color.accent.toValue()).toBe("var(--accent-color)");
		expect(theme.color.main.foreground.toValue()).toBe(
			"var(--main-foreground)",
		);
		expect(theme.color.main.background.toValue()).toBe(
			"var(--main-background)",
		);
	});

	it("should have ThemeColor instances that support opacity", () => {
		expect(theme.color.accent.opacity(5)).toBe(
			"var(--accent-color-opacity-05)",
		);
		expect(theme.color.main.foreground.opacity(80)).toBe(
			"var(--main-foreground-opacity-80)",
		);
		expect(theme.color.main.background.opacity(20)).toBe(
			"var(--main-background-opacity-20)",
		);
	});
});
