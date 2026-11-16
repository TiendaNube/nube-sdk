import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	type NubeSDKAppMetadata,
	type NubeSDKAppsMetadataEntry,
	syncAppsMetadata,
} from "./page-apps-metadata";

const KEY = "nube-devtools-apps-metadata";
const ENDPOINT = "/nubesdk/devtools/apps/";
const MINUTE = 60_000;

const PONG: NubeSDKAppMetadata = {
	app: {
		id: "9461",
		handle: "devtools-poc-pong",
		name: "Pong",
		installed_at: "2026-11-03T11:00:00+00:00",
	},
	partner: { id: 3300, name: "NubeDev" },
	script: {
		id: 3,
		src: "http://localhost:8082/pong.min.js?store=97900",
		location: "store",
		version: 2,
		version_activated_at: "2026-11-14T16:00:00+00:00",
		created_at: "2026-11-05T09:10:00+00:00",
		updated_at: "2026-11-14T16:00:00+00:00",
	},
};

function memoryStorage(): Storage {
	const items = new Map<string, string>();
	return {
		get length() {
			return items.size;
		},
		clear: () => items.clear(),
		getItem: (key) => items.get(key) ?? null,
		key: (index) => [...items.keys()][index] ?? null,
		removeItem: (key) => {
			items.delete(key);
		},
		setItem: (key, value) => {
			items.set(key, String(value));
		},
	};
}

const sync = () =>
	syncAppsMetadata(KEY, ENDPOINT, MINUTE, "X-Nube-Devtools", "true");

const jsonResponse = (status: number, body: unknown) =>
	({
		ok: status >= 200 && status < 300,
		status,
		json: async () => body,
	}) as Response;

const stored = () =>
	JSON.parse(
		window.sessionStorage.getItem(KEY) ?? "null",
	) as NubeSDKAppsMetadataEntry | null;

describe("syncAppsMetadata", () => {
	let fetchMock: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-11-16T12:00:00Z"));
		vi.stubGlobal("window", { sessionStorage: memoryStorage() });
		fetchMock = vi.fn(async () => jsonResponse(200, { apps: [PONG] }));
		vi.stubGlobal("fetch", fetchMock);
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.unstubAllGlobals();
	});

	it("asks the store with the devtools header and keeps the answer with its time", async () => {
		const result = await sync();

		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(fetchMock).toHaveBeenCalledWith(ENDPOINT, {
			headers: { "X-Nube-Devtools": "true", Accept: "application/json" },
			credentials: "same-origin",
			cache: "no-store",
		});
		expect(result).toEqual({
			fetchedAt: Date.now(),
			status: "ok",
			httpStatus: 200,
			apps: [PONG],
			source: "network",
		});
		expect(stored()).toEqual({
			fetchedAt: Date.now(),
			status: "ok",
			httpStatus: 200,
			apps: [PONG],
		});
	});

	it("answers from sessionStorage within a minute of the last request", async () => {
		await sync();
		vi.advanceTimersByTime(MINUTE - 1);

		const result = await sync();

		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(result.source).toBe("cache");
		expect(result.apps).toEqual([PONG]);
	});

	it("asks again once a minute has passed", async () => {
		await sync();
		vi.advanceTimersByTime(MINUTE);

		const result = await sync();

		expect(fetchMock).toHaveBeenCalledTimes(2);
		expect(result.source).toBe("network");
		expect(result.fetchedAt).toBe(Date.now());
	});

	it("throttles failed requests too, so a store without the route is not asked on every load", async () => {
		fetchMock.mockResolvedValue(jsonResponse(404, null));

		const first = await sync();
		const second = await sync();

		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(first).toMatchObject({
			status: "unavailable",
			httpStatus: 404,
			apps: [],
		});
		expect(second).toMatchObject({ status: "unavailable", source: "cache" });
	});

	it("keeps the last list when a later request fails", async () => {
		await sync();
		vi.advanceTimersByTime(MINUTE);
		fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));

		const result = await sync();

		expect(result).toMatchObject({
			status: "error",
			source: "network",
			apps: [PONG],
		});
		expect(stored()?.apps).toEqual([PONG]);
	});

	it("treats an answer without an apps list as an error", async () => {
		fetchMock.mockResolvedValue(jsonResponse(200, { unexpected: true }));

		const result = await sync();

		expect(result).toMatchObject({
			status: "error",
			httpStatus: 200,
			apps: [],
		});
	});

	it("ignores an unreadable stored entry and asks the store", async () => {
		window.sessionStorage.setItem(KEY, "{not json");

		const result = await sync();

		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(result.status).toBe("ok");
	});

	it("shares one request between overlapping calls", async () => {
		const [first, second] = await Promise.all([sync(), sync()]);

		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(first.apps).toEqual([PONG]);
		expect(second.apps).toEqual([PONG]);
	});
});
