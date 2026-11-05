import { describe, expect, it } from "vitest";
import { nextNubeStatusStep } from "./nube-status";

describe("nextNubeStatusStep", () => {
	it("stops as soon as the SDK is there", () => {
		expect(
			nextNubeStatusStep(
				{ status: true, loaded: false },
				{ total: 1, afterLoad: 0 },
			),
		).toBe("detected");
	});

	it("keeps checking while the page loads", () => {
		expect(
			nextNubeStatusStep(
				{ status: false, loaded: false },
				{ total: 5, afterLoad: 0 },
			),
		).toBe("retry");
	});

	it("waits a little after the page loads", () => {
		expect(
			nextNubeStatusStep(
				{ status: false, loaded: true },
				{ total: 6, afterLoad: 1 },
			),
		).toBe("retry");
		expect(
			nextNubeStatusStep(
				{ status: false, loaded: true },
				{ total: 9, afterLoad: 4 },
			),
		).toBe("missing");
	});

	it("gives up on a page that never finishes loading", () => {
		expect(
			nextNubeStatusStep(
				{ status: false, loaded: false },
				{ total: 20, afterLoad: 0 },
			),
		).toBe("missing");
	});
});
