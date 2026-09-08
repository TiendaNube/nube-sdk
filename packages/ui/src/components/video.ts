import type {
	NubeComponentVideoPlayer,
	NubeComponentVideoPlayerProps,
	NubeComponentVideoRoot,
	NubeComponentVideoRootProps,
	NubeComponentVideoYouTube,
	NubeComponentVideoYouTubeProps,
} from "@tiendanube/nube-sdk-types";
import { generateInternalId } from "./generateInternalId";

/**
 * Creates a `videoRoot` component.
 *
 * `Video.Root` is the source-agnostic wrapper for a video. It owns
 * layout (`width`, `height`, `style`), shared playback modifiers (`autoplay`,
 * `muted`, `loop`) and the source-agnostic playback event handlers (`onPlay`,
 * `onPause`, `onEnded`, `onProgress`, `onBuffer`). It must contain a
 * `Video.Player` or a `Video.YouTube`, optionally followed by overlay children
 * that render over the video when the fullscreen lightbox is open. Errors are
 * source-specific and belong to each player's own `onError`.
 *
 * @param props - The properties for configuring the video root component.
 * @returns A `NubeComponentVideoRoot` object representing the video root component.
 */
export const videoRoot = (
	props: NubeComponentVideoRootProps,
): NubeComponentVideoRoot => ({
	type: "videoRoot",
	...props,
	__internalId: generateInternalId("videoRoot", props),
});

/**
 * Creates a `videoPlayer` component.
 *
 * `Video.Player` is a self-hosted video source (MP4, HLS or DASH) rendered by
 * the SDK's bundled player engine. It must be a child of `Video.Root`, which
 * owns the shared playback modifiers and events.
 *
 * @param props - The properties for configuring the video player component.
 * @returns A `NubeComponentVideoPlayer` object representing the video player component.
 */
export const videoPlayer = (
	props: NubeComponentVideoPlayerProps,
): NubeComponentVideoPlayer => ({
	type: "videoPlayer",
	...props,
	__internalId: generateInternalId("videoPlayer", props),
});

/**
 * Creates a `videoYouTube` component.
 *
 * `Video.YouTube` embeds a YouTube video via the official IFrame Player API.
 * It must be a child of `Video.Root`. No lightbox is available (YouTube ToS
 * prohibits overlaying or cropping the embed).
 *
 * @param props - The properties for configuring the YouTube video component.
 * @returns A `NubeComponentVideoYouTube` object representing the YouTube component.
 */
export const videoYouTube = (
	props: NubeComponentVideoYouTubeProps,
): NubeComponentVideoYouTube => ({
	type: "videoYouTube",
	...props,
	__internalId: generateInternalId("videoYouTube", props),
});
