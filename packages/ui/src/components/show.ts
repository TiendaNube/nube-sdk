import type {
	NubeComponentShow,
	NubeComponentShowProps,
	NubeConditionValue,
} from "@tiendanube/nube-sdk-types";
import { generateInternalId } from "./generateInternalId";
import { toCondition } from "./to-condition";

/**
 * Creates a `show` component.
 *
 * Renders `children` while its condition matches the value of the `when`
 * signal, and `fallback` otherwise. Without an operator the condition is
 * "the value is `true`". With one (`gte={90}`, `condition={and(...)}`…), it is
 * sent as a `condition` the platform evaluates.
 *
 * Both branches are sent with the tree; the platform mounts only the one that
 * matches and swaps it when the signal changes, without rendering the slot
 * again.
 *
 * @param props - The properties for configuring the show component.
 * @returns A `NubeComponentShow` object representing the show component.
 */
export const show = <T extends NubeConditionValue = boolean>(
	props: NubeComponentShowProps<T>,
): NubeComponentShow => {
	const { condition, rest } = toCondition("Show", props);
	const node = {
		...rest,
		...(condition === undefined ? {} : { condition }),
	} as Omit<NubeComponentShow, "type" | "__internalId">;
	return {
		type: "show",
		...node,
		__internalId: generateInternalId("show", node),
	};
};
