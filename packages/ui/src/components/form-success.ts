import type {
	NubeComponentFormSuccess,
	NubeComponentFormSuccessProps,
} from "@tiendanube/nube-sdk-types";
import { generateInternalId } from "./generateInternalId";

/**
 * Creates a `formSuccess` component.
 *
 * Conditional container rendered by `formRoot` when the submit fetch
 * resolves with `ok: true`. While shown, the regular form children are
 * unmounted; only this block and its descendants are visible. A
 * `formResetter` placed inside returns the form to the `idle` state.
 *
 * @param props - The properties for configuring the formSuccess component.
 * @returns A `NubeComponentFormSuccess` object.
 */
export const formSuccess = (
	props: NubeComponentFormSuccessProps,
): NubeComponentFormSuccess => ({
	type: "formSuccess",
	...props,
	__internalId: generateInternalId("formSuccess", props),
});
