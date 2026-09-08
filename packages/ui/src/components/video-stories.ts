import type {
	NubeComponentVideoStories,
	NubeComponentVideoStoriesProps,
} from "@tiendanube/nube-sdk-types";
import { generateInternalId } from "./generateInternalId";

/**
 * Creates a `videoStories` component.
 *
 * `VideoStories` is a vertical, stories-style player for a sequence of
 * self-hosted videos (MP4, HLS or DASH). It renders inline as a compact 9:16
 * card; tapping the card expands to a fullscreen overlay. Events (`onOpen`,
 * `onClose`, `onChange`, `onComplete`, `onError`) are observe-only — they
 * never gate playback.
 *
 * @param props - The properties for configuring the video stories component.
 * @returns A `NubeComponentVideoStories` object.
 */
export const videoStories = (
	props: NubeComponentVideoStoriesProps,
): NubeComponentVideoStories => ({
	type: "videoStories",
	...props,
	__internalId: generateInternalId("videoStories", props),
});
