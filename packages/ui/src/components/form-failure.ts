import type {
	NubeComponentFormFailure,
	NubeComponentFormFailureProps,
} from "@tiendanube/nube-sdk-types";
import { generateInternalId } from "./generateInternalId";

/**
 * Creates a `formFailure` component.
 *
 * Conditional container rendered by `formRoot` when the submit fetch
 * rejects or the response is not `ok`. Mount/unmount semantics mirror
 * `formSuccess`.
 *
 * @param props - The properties for configuring the formFailure component.
 * @returns A `NubeComponentFormFailure` object.
 */
export const formFailure = (
	props: NubeComponentFormFailureProps,
): NubeComponentFormFailure => ({
	type: "formFailure",
	...props,
	__internalId: generateInternalId("formFailure", props),
});
