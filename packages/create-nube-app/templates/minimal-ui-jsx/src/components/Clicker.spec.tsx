import { describe, expect, it, vi } from "vitest";
import { Clicker } from "./Clicker";

type MockElement = {
	type: string;
	props: { onClick: () => void };
	children: unknown[];
};

// Hoisted with vi.mock, which runs before the imports
const { mockComponent } = vi.hoisted(() => ({
	mockComponent:
		(type: string) =>
		({ children, ...props }: Record<string, unknown>) => ({
			type,
			props,
			children,
		}),
}));

// Mock the styled components
vi.mock("./styles", () => ({
	PillButton: mockComponent("Button"),
	Dot: mockComponent("Dot"),
}));

vi.mock("./Pulse", () => ({
	Pulse: mockComponent("Pulse"),
}));

/** The label is the signal among the button children. */
const labelOf = (button: MockElement) =>
	(
		button.children.find((child) => "value" in (child as object)) as {
			value: string;
		}
	).value;

describe("Clicker", () => {
	it("should count the clicks in the label", () => {
		const button = Clicker() as unknown as MockElement;
		expect(labelOf(button)).toBe("Click me!");

		button.props.onClick();
		button.props.onClick();

		expect(labelOf(button)).toBe("Clicks: 2");
	});
});
