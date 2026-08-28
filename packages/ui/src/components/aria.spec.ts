import { describe, expect, it } from "vitest";
import { box } from "./box";
import { button } from "./button";
import { column } from "./column";
import { row } from "./row";

describe("accessibility props", () => {
	it("box carries role, aria and tabIndex", () => {
		const node = box({
			role: "region",
			ariaLabel: "Customer reviews",
			ariaRoleDescription: "Carousel",
			tabIndex: 0,
		});

		expect(node.type).toBe("box");
		expect(node.role).toBe("region");
		expect(node.ariaLabel).toBe("Customer reviews");
		expect(node.ariaRoleDescription).toBe("Carousel");
		expect(node.tabIndex).toBe(0);
	});

	it("row and column inherit them from box", () => {
		// Row and Column are Omit<NubeComponentBoxProps, "direction">, so they
		// get whatever Box gets. This test is here to catch the day someone
		// stops deriving them from Box.
		const r = row({ role: "group", ariaLabel: "Slide 1 of 4" });
		const c = column({ ariaHidden: true });

		expect(r.role).toBe("group");
		expect(r.ariaLabel).toBe("Slide 1 of 4");
		expect(c.ariaHidden).toBe(true);
	});

	it("button carries ariaCurrent", () => {
		const node = button({ children: "1", ariaCurrent: true });

		expect(node.ariaCurrent).toBe(true);
	});

	it("ariaCurrent accepts the non boolean values of the attribute", () => {
		// aria-current is not a boolean in the spec: a breadcrumb uses "page",
		// a wizard uses "step". Restricting it to boolean would close the door
		// on those without any reason.
		expect(button({ children: "Home", ariaCurrent: "page" }).ariaCurrent).toBe(
			"page",
		);
		expect(box({ ariaCurrent: "step" }).ariaCurrent).toBe("step");
	});

	it("leaves every accessibility prop undefined when not passed", () => {
		const node = box({});

		expect(node.role).toBeUndefined();
		expect(node.ariaLabel).toBeUndefined();
		expect(node.ariaCurrent).toBeUndefined();
		expect(node.ariaHidden).toBeUndefined();
		expect(node.tabIndex).toBeUndefined();
	});
});
