import type {
	NubeComponentMatchWhen,
	NubeComponentMatchWhenProps,
} from "@tiendanube/nube-sdk-types";
import { generateInternalId } from "./generateInternalId";
import { NEVER, toCondition } from "./to-condition";

/**
 * Creates a `matchWhen` component, a branch of `matchValue`.
 *
 * Takes exactly one operator: `is`, `oneOf`, `gt`, `gte`, `lt`, `lte`,
 * `startsWith`, `endsWith`, `includes` or `condition`. Whichever it is, the
 * branch is sent as a `condition` that the platform evaluates against the
 * value of the `matchValue` signal.
 *
 * @param props - The properties for configuring the matchWhen component.
 * @returns A `NubeComponentMatchWhen` object representing the component.
 */
export const matchWhen = (
	props: NubeComponentMatchWhenProps,
): NubeComponentMatchWhen => {
	const { condition, rest } = toCondition("Match.When", props);
	if (condition === undefined) {
		console.warn(
			"[nube-sdk] Match.When takes an operator, such as `is` or `condition`; it never matches.",
		);
	}
	const node = { ...rest, condition: condition ?? NEVER };
	return {
		type: "matchWhen",
		...node,
		__internalId: generateInternalId("matchWhen", node),
	};
};
