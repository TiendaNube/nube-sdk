import { describe, expect, it } from "vitest";
import {
	type NubeSDKAppMetadata,
	formatAppLabel,
	indexAppsMetadata,
} from "./apps-metadata";

const metadata = (
	app: Partial<NubeSDKAppMetadata["app"]>,
	partner: Partial<NubeSDKAppMetadata["partner"]> = {},
): NubeSDKAppMetadata => ({
	app: { id: "9461", handle: null, name: null, installed_at: null, ...app },
	partner: { id: null, name: null, ...partner },
	script: {
		id: 3,
		src: "http://localhost:8082/pong.min.js?store=97900",
		location: "store",
		version: null,
		version_activated_at: null,
		created_at: null,
		updated_at: null,
	},
});

describe("formatAppLabel", () => {
	it("names the app after its name and partner", () => {
		expect(
			formatAppLabel(
				metadata(
					{ name: "Pong", handle: "devtools-poc-pong" },
					{ name: "NubeDev" },
				),
			),
		).toBe("Pong by NubeDev");
	});

	it("falls back to the handle when the app has no name", () => {
		expect(
			formatAppLabel(
				metadata({ handle: "devtools-poc-pong" }, { name: "NubeDev" }),
			),
		).toBe("devtools-poc-pong by NubeDev");
	});

	it("drops the partner when the store has no name for it", () => {
		expect(formatAppLabel(metadata({ name: "Pong" }))).toBe("Pong");
	});

	it("has nothing to say when the app has neither name nor handle", () => {
		expect(formatAppLabel(metadata({}, { name: "NubeDev" }))).toBeNull();
	});

	it("has nothing to say about an app the store did not describe", () => {
		expect(formatAppLabel(undefined)).toBeNull();
	});
});

describe("indexAppsMetadata", () => {
	it("keys the metadata by app id", () => {
		const ping = metadata({ id: "9460", name: "Ping" });
		const pong = metadata({ id: "9461", name: "Pong" });

		expect(indexAppsMetadata([ping, pong])).toEqual({
			"9460": ping,
			"9461": pong,
		});
	});

	it("skips entries without an app id", () => {
		const broken = metadata({ id: "" });

		expect(indexAppsMetadata([broken])).toEqual({});
	});
});
