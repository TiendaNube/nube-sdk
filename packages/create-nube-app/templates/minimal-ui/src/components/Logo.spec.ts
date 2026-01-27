import { describe, expect, it, vi } from "vitest";
import { Logo } from "./Logo";

// Mock the SDK functions
vi.mock("@tiendanube/nube-sdk-ui", () => ({
	svgRoot: vi.fn((props) => props),
	svgPath: vi.fn((props) => ({ type: "path", ...props })),
}));

describe("Logo", () => {
	it("should return a valid SVG element", () => {
		const result = Logo();
		expect(result).toBeDefined();
		expect(result.xmlns).toBe("http://www.w3.org/2000/svg");
		expect(result.width).toBe("246");
		expect(result.height).toBe("40");
		expect(result.viewBox).toBe("0 0 123 20");
	});
});
