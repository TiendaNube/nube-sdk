import { fragment } from "@tiendanube/nube-sdk-ui";
import type { JSX } from "./jsx-runtime";
import type { FunctionComponent } from "./types";

export function renderJSX(
	tag: FunctionComponent | undefined,
	props: Record<string, unknown>,
	key?: string | number,
): JSX.Element {
	// Fragment
	if (tag === undefined) {
		return fragment(props);
	}

	// Function
	if (typeof tag === "function") {
		return tag(key === undefined ? props : { ...props, key });
	}

	// Normal tag
	throw new Error("Unsupported component");
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function renderFragment(props: any): JSX.Element {
	return renderJSX(undefined, props);
}
