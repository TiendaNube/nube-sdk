import type {
	NubeComponentChildren,
	NubeComponentMatchValue,
	NubeComponentMatchValueProps,
} from "@tiendanube/nube-sdk-types";
import { generateInternalId } from "./generateInternalId";

const BRANCH_TYPES = new Set(["matchWhen", "matchDefault"]);

function branchType(child: unknown): string | undefined {
	if (typeof child !== "object" || child === null) return undefined;
	const { type } = child as { type?: unknown };
	return typeof type === "string" ? type : undefined;
}

/**
 * Warns about children the platform ignores: anything that is not a
 * `matchWhen` or a `matchDefault`, and every `matchDefault` after the first.
 */
function warnAboutChildren(children: NubeComponentChildren | undefined) {
	if (children === undefined) return;
	const list = Array.isArray(children) ? children : [children];
	let defaults = 0;
	for (const child of list) {
		const type = branchType(child);
		if (!type || !BRANCH_TYPES.has(type)) {
			console.warn(
				"[nube-sdk] Match.Value only renders Match.When and Match.Default children; ignoring",
				child,
			);
			continue;
		}
		if (type === "matchDefault" && ++defaults === 2) {
			console.warn(
				"[nube-sdk] Match.Value takes a single Match.Default; only the first one is used.",
			);
		}
	}
}

/**
 * Creates a `matchValue` component.
 *
 * Renders the children of the first `matchWhen` whose `is` or `in` matches the
 * value of the `of` signal, or the children of `matchDefault` when none does.
 * Every branch is sent with the tree; the platform mounts only the matching
 * one and swaps it when the signal changes, without rendering the slot again.
 *
 * @param props - The properties for configuring the matchValue component.
 * @returns A `NubeComponentMatchValue` object representing the component.
 */
export const matchValue = (
	props: NubeComponentMatchValueProps,
): NubeComponentMatchValue => {
	warnAboutChildren(props.children);
	return {
		type: "matchValue",
		...props,
		__internalId: generateInternalId("matchValue", props),
	};
};
