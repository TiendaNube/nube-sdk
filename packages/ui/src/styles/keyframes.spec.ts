import { beforeEach, describe, expect, it, vi } from "vitest";
import { isKeyframesObject, keyframes } from "./keyframes";
import * as minifyModule from "./minify";
import * as shortidModule from "./shortid";

vi.mock("./minify", () => ({
	minify: vi.fn((css: string) => `MINIFIED(${css})`),
}));

vi.mock("./shortid", () => ({
	shortid: vi.fn(() => "mockedid"),
}));

describe("keyframes", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should generate a keyframes object with a unique name and minified css", () => {
		const kf = keyframes`
      from { opacity: 0; }
      to { opacity: 1; }
    `;
		expect(kf.name).toBe("kf-mockedid");
		expect(kf.css).toBe(
			"@keyframes kf-mockedid{MINIFIED(\n      from { opacity: 0; }\n      to { opacity: 1; }\n    )}",
		);
		expect(typeof kf.toString).toBe("function");
		expect(kf.toString()).toBe("kf-mockedid");
	});

	it("should call minify with the raw CSS string", () => {
		const minify = vi.mocked(minifyModule.minify);
		keyframes`from { left: 0; } to { left: 100px; }`;
		expect(minify).toHaveBeenCalledWith(
			"from { left: 0; } to { left: 100px; }",
		);
	});

	it("should call shortid to generate the name", () => {
		const shortid = vi.mocked(shortidModule.shortid);
		keyframes`from { top: 0; } to { top: 100px; }`;
		expect(shortid).toHaveBeenCalled();
	});

	it("should interpolate expressions in the template string", () => {
		const value = "50%";
		const kf = keyframes`
      from { left: 0; }
      50% { left: ${value}; }
      to { left: 100px; }
    `;
		expect(kf.css).toContain("50% { left: 50%; }");
	});

	it("should return a valid KeyframesObject", () => {
		const kf = keyframes`from { opacity: 0; } to { opacity: 1; }`;
		expect(typeof kf.name).toBe("string");
		expect(typeof kf.css).toBe("string");
		expect(typeof kf.toString).toBe("function");
		expect(kf.toString()).toBe(kf.name);
	});
});

describe("isKeyframesObject", () => {
	it("should return true for a valid KeyframesObject", () => {
		const kf = keyframes`from { opacity: 0; } to { opacity: 1; }`;
		expect(isKeyframesObject(kf)).toBe(true);
	});

	it("should return false for objects without css property", () => {
		expect(isKeyframesObject({})).toBe(false);
		expect(isKeyframesObject(null)).toBe(false);
		expect(isKeyframesObject(undefined)).toBe(false);
		expect(isKeyframesObject({ name: "kf-1" })).toBe(false);
	});
});
