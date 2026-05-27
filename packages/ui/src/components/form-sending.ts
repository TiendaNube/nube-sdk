import type {
	NubeComponentFormSending,
	NubeComponentFormSendingProps,
} from "@tiendanube/nube-sdk-types";
import { generateInternalId } from "./generateInternalId";

/**
 * Creates a `formSending` component.
 *
 * Conditional container rendered by `formRoot` while the submit fetch
 * is in flight. Typically used for loaders / skeletons.
 *
 * @param props - The properties for configuring the formSending component.
 * @returns A `NubeComponentFormSending` object.
 */
export const formSending = (
	props: NubeComponentFormSendingProps,
): NubeComponentFormSending => ({
	type: "formSending",
	...props,
	__internalId: generateInternalId("formSending", props),
});
