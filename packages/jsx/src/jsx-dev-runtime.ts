import type { NubeComponent } from "@tiendanube/nube-sdk-types";
import { renderFragment, renderJSX } from "./rendering";
import type { FunctionComponent } from "./types";

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace JSX {
	// Declare the shape of JSX rendering result
	// This is required so the return types of components can be inferred
	export type Element = NubeComponent;
}

// Expose the main namespace
export type { JSX };

/**
 * Creates a JSX element with development information.
 * This function is used by the JSX transform in development mode.
 * It provides additional information like component names and source locations.
 */
export function jsxDEV(
	type: FunctionComponent | undefined,
	props: Record<string, unknown>,
	key: string | undefined,
	isStaticChildren: boolean,
	source: { fileName: string; lineNumber: number },
	self: unknown,
): NubeComponent {
	// In development, we add source information to the component
	const component = renderJSX(type, props, key);

	// Add development metadata
	if (process.env.NODE_ENV !== "production") {
		Object.defineProperty(component, "__source", {
			value: source,
			enumerable: false,
		});
	}

	return component;
}

/**
 * Creates a JSX element with development information.
 * This is an alias for jsxDEV for consistency with the JSX transform.
 */
export const jsx = jsxDEV;

/**
 * Creates a JSX element with development information for static children.
 * This is an alias for jsxDEV for consistency with the JSX transform.
 */
export const jsxs = jsxDEV;

/**
 * Creates a fragment with development information.
 */
export const Fragment = renderFragment;
