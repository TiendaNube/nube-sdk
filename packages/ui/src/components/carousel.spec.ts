import { describe, expect, it } from "vitest";
import { carouselItem, carouselItemGroup, carouselRoot } from "./carousel";

describe("carouselRoot", () => {
	it("creates a carouselRoot with the type tag and a stable internal id", () => {
		const node = carouselRoot({ orientation: "vertical", loop: true });

		expect(node.type).toBe("carouselRoot");
		expect(node.orientation).toBe("vertical");
		expect(node.loop).toBe(true);
		expect(node.__internalId).toMatch(/^carouselRoot-test-app-id-[a-z0-9]+$/);
		expect(
			carouselRoot({ orientation: "vertical", loop: true }).__internalId,
		).toBe(node.__internalId);
	});

	it("keeps the same id when only the controlled index changes", () => {
		const children = [
			carouselItemGroup({
				children: [carouselItem({ id: "a" }), carouselItem({ id: "b" })],
			}),
		];
		const first = carouselRoot({ ariaLabel: "Stories", index: 0, children });
		const moved = carouselRoot({ ariaLabel: "Stories", index: 2, children });
		const uncontrolled = carouselRoot({ ariaLabel: "Stories", children });

		expect(moved.__internalId).toBe(first.__internalId);
		expect(uncontrolled.__internalId).toBe(first.__internalId);
		// The index still reaches the renderer.
		expect(moved.index).toBe(2);
	});

	it("still changes the id when any other prop changes", () => {
		const base = carouselRoot({ ariaLabel: "Stories", index: 0 });
		const other = carouselRoot({ ariaLabel: "Carousel", index: 0 });

		expect(other.__internalId).not.toBe(base.__internalId);
	});
});
