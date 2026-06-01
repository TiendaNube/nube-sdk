import type {
	NubeComponentFormRoot,
	NubeComponentFormRootProps,
} from "@tiendanube/nube-sdk-types";
import { generateInternalId } from "./generateInternalId";

/**
 * Creates a `formRoot` component.
 *
 * A `formRoot` declares a native HTML form whose submission is executed on
 * the main thread. On submit the host adapter builds a `FormData` from the
 * descendant `formField` inputs, performs `fetch(target, { method, body })`,
 * and dispatches the outcome back to the worker through the optional
 * `onSuccess` / `onFail` callbacks.
 *
 * @param props - The properties for configuring the formRoot component.
 * @returns A `NubeComponentFormRoot` object representing the form container.
 */
export const formRoot = (
	props: NubeComponentFormRootProps,
): NubeComponentFormRoot => ({
	type: "formRoot",
	...props,
	__internalId: generateInternalId("formRoot", props),
});
