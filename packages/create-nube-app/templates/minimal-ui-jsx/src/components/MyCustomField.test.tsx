import type {
	NubeComponent,
	NubeComponentBox,
	NubeComponentField,
	NubeSDKState,
} from "@tiendanube/nube-sdk-types";
import { describe, expect, it, vi } from "vitest";
import { MyCustomField } from "./MyCustomField";

describe("MyCustomField", () => {
	it("should render a Box with correct dimensions", () => {
		const result = MyCustomField() as NubeComponentBox;

		expect(result).toEqual({
			type: "box",
			width: 100,
			height: 200,
			children: expect.any(Array),
		});
	});

	it("should render a Text component with correct content", () => {
		const result = MyCustomField() as NubeComponentBox;
		const children = result.children as NubeComponent[];

		expect(children[0]).toEqual({
			type: "txt",
			children: "Hello World!",
		});
	});

	it("should render a Field component with correct props", () => {
		const result = MyCustomField() as NubeComponentBox;
		const children = result.children as NubeComponent[];
		const field = children[1] as NubeComponentField;

		expect(field).toEqual({
			type: "field",
			id: "my-custom-field",
			label: "Name",
			name: "Name",
			onChange: expect.any(Function),
		});
	});

	it("should log user input when field changes", () => {
		const consoleSpy = vi.spyOn(console, "log");
		const result = MyCustomField() as NubeComponentBox;
		const children = result.children as NubeComponent[];
		const field = children[1] as NubeComponentField;

		// Simulate field change event
		field.onChange?.({
			type: "change",
			state: {} as NubeSDKState,
			value: "John Doe",
		});

		expect(consoleSpy).toHaveBeenCalledWith("User name: John Doe");
	});
});
