import { describe, expect, it, vi } from "vitest";
import { Logo } from "./Logo";

// Mock the SDK SVG components
vi.mock("@tiendanube/nube-sdk-jsx", () => {
	const createMockComponent = (name: string) => {
		const Component = (props: Record<string, unknown>) => {
			const { children, ...restProps } = props;
			return {
				type: name,
				props: restProps,
				children: children || [],
			};
		};
		Component.displayName = name;
		return Component;
	};

	return {
		Svg: {
			Root: createMockComponent("Svg.Root"),
			Path: createMockComponent("Svg.Path"),
		},
	};
});

describe("Logo", () => {
	it("should render", () => {
		const result = Logo();
		expect(result).toBeDefined();
	});
});
