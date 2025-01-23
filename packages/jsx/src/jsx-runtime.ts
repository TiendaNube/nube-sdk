import type { NubeComponent } from "@tiendanube/nube-sdk-types";
import { renderFragment, renderJSX } from "./rendering";

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace JSX {
	// Declare the shape of JSX rendering result
	// This is required so the return types of components can be inferred
	export type Element = NubeComponent;
}

// Expose the main namespace
export type { JSX };

// Expose factories
export const jsx = renderJSX;
export const jsxs = renderJSX;
export const jsxDEV = renderJSX;
export const Fragment = renderFragment;
