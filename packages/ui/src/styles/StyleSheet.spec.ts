import { describe, it, expect } from "vitest";
import { StyleSheet } from "./StyleSheet";
import { ThemeColor } from "./ThemeColor";

describe("StyleSheet", () => {
	describe("create", () => {
		it("should create styles with ThemeColor values", () => {
			const styles = StyleSheet.create({
				container: {
					backgroundColor: new ThemeColor("primary"),
					color: new ThemeColor("text"),
				},
			});

			expect(styles.container.backgroundColor).toBe("var(--primary)");
			expect(styles.container.color).toBe("var(--text)");
		});

		it("should handle nested style objects", () => {
			const styles = StyleSheet.create({
				container: {
					backgroundColor: new ThemeColor("primary"),
					":hover": {
						backgroundColor: new ThemeColor("primary").opacity(50),
					},
				},
			});

			expect(styles.container.backgroundColor).toBe("var(--primary)");
			expect(styles.container[":hover"].backgroundColor).toBe(
				"var(--primary-opacity-50)",
			);
		});

		it("should preserve non-ThemeColor values", () => {
			const styles = StyleSheet.create({
				container: {
					width: "100%",
					height: 100,
					display: "flex",
				},
			});

			expect(styles.container.width).toBe("100%");
			expect(styles.container.height).toBe(100);
			expect(styles.container.display).toBe("flex");
		});

		it("should handle mixed ThemeColor and regular values", () => {
			const styles = StyleSheet.create({
				container: {
					backgroundColor: new ThemeColor("primary"),
					width: "100%",
					":hover": {
						backgroundColor: new ThemeColor("primary").opacity(50),
						width: "50%",
					},
				},
			});

			expect(styles.container.backgroundColor).toBe("var(--primary)");
			expect(styles.container.width).toBe("100%");
			expect(styles.container[":hover"].backgroundColor).toBe(
				"var(--primary-opacity-50)",
			);
			expect(styles.container[":hover"].width).toBe("50%");
		});

		it("should handle empty style objects", () => {
			const styles = StyleSheet.create({
				container: {},
			});

			expect(styles.container).toEqual({});
		});

		it("should handle multiple style objects", () => {
			const styles = StyleSheet.create({
				container: {
					backgroundColor: new ThemeColor("primary"),
				},
				text: {
					color: new ThemeColor("text"),
				},
			});

			expect(styles.container.backgroundColor).toBe("var(--primary)");
			expect(styles.text.color).toBe("var(--text)");
		});

		it("should handle invalid style objects", () => {
			const invalidObject = {
				toString: () => "invalid",
				someMethod: () => {},
			};

			const styles = StyleSheet.create({
				container: {
					invalid: invalidObject,
					backgroundColor: new ThemeColor("primary"),
				},
			});

			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			expect((styles.container as any).invalid).toStrictEqual(invalidObject);
			expect(styles.container.backgroundColor).toBe("var(--primary)");
		});
	});
});
