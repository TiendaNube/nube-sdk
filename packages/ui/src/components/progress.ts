import type {
	NubeComponentProgress,
	NubeComponentProgressProps,
} from "@tiendanube/nube-sdk-types";
import { generateInternalId } from "./generateInternalId";

/**
 * Creates a `progress` component.
 *
 * A `progress` represents a completion progress of a task. It supports properties such as `value` and `max`
 * to define the progress range and current state. When no value is provided, the progress bar
 * displays in an indeterminate state.
 *
 * @param props - The properties for configuring the progress component.
 * @returns A `NubeComponentProgress` object representing the progress component.
 */
export const progress = (
	props: NubeComponentProgressProps,
): NubeComponentProgress => ({
	type: "progress",
	...props,
	__internalId: generateInternalId("progress", props),
});
