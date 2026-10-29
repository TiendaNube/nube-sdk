import { describe, expect, it } from "vitest";
import { accordionRoot } from "./accordion";
import { accordionHeader } from "./accordion.header";
import { button } from "./button";
import { column } from "./column";
import { image, img } from "./image";
import { link } from "./link";
import { popoverButton } from "./popover-button";
import { popoverContent } from "./popover-content";
import { popoverRoot } from "./popover-root";
import { row } from "./row";
import { scopedClassNameProp } from "./scopedClassNameProp";
import { sideScroll } from "./side-scroll";
import { text, txt } from "./text";

describe("scopedClassNameProp", () => {
	it("should prefix className with the app id", () => {
		expect(scopedClassNameProp("card")).toEqual({
			className: "app-test-app-id_card",
		});
	});

	it("should prefix each class in className", () => {
		expect(scopedClassNameProp(" foo  bar ")).toEqual({
			className: "app-test-app-id_foo app-test-app-id_bar",
		});
	});

	it("should not prefix a class twice", () => {
		expect(scopedClassNameProp("app-test-app-id_card")).toEqual({
			className: "app-test-app-id_card",
		});
	});

	it("should return an empty object when className is undefined", () => {
		expect(scopedClassNameProp(undefined)).toEqual({});
	});
});

describe("components with className", () => {
	const builders = {
		accordionHeader: () => accordionHeader({ className: "card" }),
		accordionRoot: () => accordionRoot({ className: "card" }),
		button: () => button({ className: "card" }),
		column: () => column({ className: "card" }),
		image: () => image({ src: "a.png", alt: "a", className: "card" }),
		img: () => img({ src: "a.png", alt: "a", className: "card" }),
		link: () => link({ className: "card" }),
		popoverButton: () => popoverButton({ className: "card" }),
		popoverContent: () => popoverContent({ className: "card" }),
		popoverRoot: () => popoverRoot({ className: "card" }),
		row: () => row({ className: "card" }),
		sideScroll: () => sideScroll({ className: "card" }),
		text: () => text({ className: "card" }),
		txt: () => txt({ className: "card" }),
	};

	it.each(Object.entries(builders))(
		"%s should scope className with the app id",
		(_, build) => {
			expect(build().className).toBe("app-test-app-id_card");
		},
	);
});
