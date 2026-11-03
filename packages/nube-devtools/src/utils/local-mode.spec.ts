import { afterEach, describe, expect, it, vi } from "vitest";
import { fingerprintScript, isValidUrl } from "./local-mode";

function respondWith(body: string, status = 200) {
	return vi.fn(async () => new Response(body, { status }));
}

describe("isValidUrl", () => {
	it("accepts absolute URLs and rejects the rest", () => {
		expect(isValidUrl("http://localhost:8080/main.min.js")).toBe(true);
		expect(isValidUrl("main.min.js")).toBe(false);
		expect(isValidUrl("")).toBe(false);
	});
});

describe("fingerprintScript", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("is stable for the same body", async () => {
		vi.stubGlobal("fetch", respondWith("console.log(1)"));
		const first = await fingerprintScript("http://localhost:8080/main.min.js");
		const second = await fingerprintScript("http://localhost:8080/main.min.js");
		expect(first).not.toBeNull();
		expect(first).toBe(second);
	});

	it("changes when the body changes", async () => {
		vi.stubGlobal("fetch", respondWith("console.log(1)"));
		const before = await fingerprintScript("http://localhost:8080/main.min.js");
		vi.stubGlobal("fetch", respondWith("console.log(2)"));
		const after = await fingerprintScript("http://localhost:8080/main.min.js");
		expect(after).not.toBe(before);
	});

	it("bypasses the HTTP cache", async () => {
		const fetchMock = respondWith("x");
		vi.stubGlobal("fetch", fetchMock);
		await fingerprintScript("http://localhost:8080/main.min.js");
		expect(fetchMock).toHaveBeenCalledWith(
			"http://localhost:8080/main.min.js",
			{ cache: "no-store" },
		);
	});

	it("returns null while the bundle is missing or the server is down", async () => {
		vi.stubGlobal("fetch", respondWith("", 404));
		expect(await fingerprintScript("http://localhost:8080/main.min.js")).toBe(
			null,
		);

		vi.stubGlobal(
			"fetch",
			vi.fn(async () => {
				throw new TypeError("Failed to fetch");
			}),
		);
		expect(await fingerprintScript("http://localhost:8080/main.min.js")).toBe(
			null,
		);
	});
});
