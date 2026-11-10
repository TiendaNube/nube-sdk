import { describe, expect, it } from "vitest";
import {
	buildApplicationServerData,
	getLocalModeEntryIds,
	readScriptUrls,
	resolveScriptUrls,
} from "./local-mode-scripts";

const DEFAULT_URL = "http://localhost:8080/main.min.js";
const A = "http://localhost:8081/a.min.js";
const B = "http://localhost:8081/b.min.js";

describe("resolveScriptUrls", () => {
	it("uses the default URL when the first field is empty", () => {
		expect(resolveScriptUrls(["  "], DEFAULT_URL)).toEqual([DEFAULT_URL]);
	});

	it("drops empty extra fields and trims the others", () => {
		expect(resolveScriptUrls([` ${A} `, "", ` ${B}`], DEFAULT_URL)).toEqual([
			A,
			B,
		]);
	});
});

describe("buildApplicationServerData", () => {
	it("keeps the single-script shape for one script", () => {
		expect(
			buildApplicationServerData({
				urls: [A],
				appId: "app",
				type: "new",
				connected: true,
			}),
		).toEqual({ script: A, connected: true, appId: "app", type: "new" });
	});

	it("lists every script, with sequential ids, and keeps the first as script", () => {
		expect(
			buildApplicationServerData({
				urls: [A, B],
				appId: "app",
				type: "new",
				connected: true,
			}),
		).toEqual({
			script: A,
			connected: true,
			appId: "app",
			type: "new",
			scripts: [
				{ id: "1", script: A },
				{ id: "2", script: B },
			],
		});
	});
});

describe("readScriptUrls", () => {
	it("reads the single-script shape", () => {
		expect(readScriptUrls({ script: A })).toEqual([A]);
	});

	it("reads every script when there are several", () => {
		expect(
			readScriptUrls({
				script: A,
				scripts: [
					{ id: "1", script: A },
					{ id: "2", script: B },
				],
			}),
		).toEqual([A, B]);
	});

	it("falls back to script when scripts is malformed", () => {
		expect(
			readScriptUrls({
				script: A,
				scripts: [{ id: "1", script: A }, { id: 2 } as never],
			}),
		).toEqual([A]);
	});

	it("returns nothing without a script", () => {
		expect(readScriptUrls({})).toEqual([]);
	});
});

describe("getLocalModeEntryIds", () => {
	it("uses the app id alone for one script", () => {
		expect(getLocalModeEntryIds("app", 1)).toEqual(["app"]);
	});

	it("gives each script its own <appId>_<scriptId> id", () => {
		expect(getLocalModeEntryIds("app", 3)).toEqual(["app_1", "app_2", "app_3"]);
	});
});
