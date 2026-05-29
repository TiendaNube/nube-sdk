import type { NubeComponent } from "@tiendanube/nube-sdk-types";
import { describe, expect, it } from "vitest";
import { box } from "../components/box";
import { text } from "../components/text";
import { styled } from "./styled";

type MountedComponent = NubeComponent & { __internalId: string };

describe("Styled Components Internal ID Generation Bug", () => {
	describe("when children are strings", () => {
		describe("with components that have the same styles", () => {
			const redComponent = styled(text)`background-color: red;`;
			const anotherRedComponent = styled(text)`background-color: red;`;

			it("should generate same internal IDs for the same string value", () => {
				const children = "text";
				expect(redComponent({ children })).toEqual(
					anotherRedComponent({ children }),
				);
			});

			it("should generate different internal IDs for different string values", () => {
				const component1 = redComponent({
					children: "Hello",
				}) as MountedComponent;
				const component2 = anotherRedComponent({
					children: "World",
				}) as MountedComponent;

				expect(component1).not.toEqual(component2);
				expect(component1.__internalId).not.toEqual(component2.__internalId);
			});
		});

		describe("with components that have different styles", () => {
			const redComponent = styled(text)`background-color: red;`;
			const blueComponent = styled(text)`background-color: blue;`;

			it("should generate different internal IDs for the same string value", () => {
				const children = "text";
				expect(redComponent({ children })).not.toEqual(
					blueComponent({ children }),
				);
			});

			it("should generate different internal IDs for the different string values", () => {
				expect(redComponent({ children: "b" })).not.toEqual(
					blueComponent({ children: "b" }),
				);
			});
		});
	});

	describe("when children are components", () => {
		describe("with components that have the same styles", () => {
			const redBoxComponent = styled(box)`background-color: red;`;
			const anotherRedBoxComponent = styled(box)`background-color: red;`;

			it("should generate same internal IDs for the same component children", () => {
				const children = text({ children: "text" });
				expect(redBoxComponent({ children })).toEqual(
					anotherRedBoxComponent({ children }),
				);
			});

			it("should generate same internal IDs for the different component children", () => {
				const childrenOne = text({ children: "one" });
				const childrenTwo = text({ children: "two" });

				const componentOne = redBoxComponent({
					children: childrenOne,
				}) as MountedComponent;
				const componentTwo = anotherRedBoxComponent({
					children: childrenTwo,
				}) as MountedComponent;

				expect(componentOne.__internalId).toEqual(componentTwo.__internalId);
			});
		});

		describe("with components that have different styles", () => {
			const redBoxComponent = styled(box)`background-color: red;`;
			const blueBoxComponent = styled(box)`background-color: blue;`;

			it("should generate different internal IDs for the same component children", () => {
				const children = text({ children: "text" });

				const redComponent = redBoxComponent({ children }) as MountedComponent;
				const blueComponent = blueBoxComponent({
					children,
				}) as MountedComponent;

				expect(redComponent.__internalId).not.toEqual(
					blueComponent.__internalId,
				);
			});

			it("should generate different internal IDs for the different component children", () => {
				const childrenOne = text({ children: "one" });
				const childrenTwo = text({ children: "two" });

				const redComponent = redBoxComponent({
					children: childrenOne,
				}) as MountedComponent;
				const blueComponent = blueBoxComponent({
					children: childrenTwo,
				}) as MountedComponent;

				expect(redComponent.__internalId).not.toEqual(
					blueComponent.__internalId,
				);
			});
		});
	});
});
