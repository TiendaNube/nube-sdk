import type {
	NubeComponentVideoIndicator,
	NubeComponentVideoIndicatorProps,
	NubeComponentVideoMuteButton,
	NubeComponentVideoMuteButtonProps,
	NubeComponentVideoPlayButton,
	NubeComponentVideoPlayButtonProps,
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

/**
 * Creates a `videoPlayButton` component.
 *
 * `Video.PlayButton` toggles play/pause on the player of the surrounding
 * `Video.Root`. The click acts on the player directly, so playback can start
 * with sound without the native controls. It must be a child of `Video.Root`.
 *
 * @param props - The properties for configuring the play button component.
 * @returns A `NubeComponentVideoPlayButton` object representing the play button component.
 */
export const videoPlayButton = (
	props: NubeComponentVideoPlayButtonProps,
): NubeComponentVideoPlayButton => ({
	type: "videoPlayButton",
	...props,
	__internalId: generateInternalId("videoPlayButton", props),
});

/**
 * Creates a `videoMuteButton` component.
 *
 * `Video.MuteButton` toggles mute on the player of the surrounding
 * `Video.Root`. The click acts on the player directly, so an autoplaying
 * (always muted) video can be unmuted without pausing. It must be a child of
 * `Video.Root`.
 *
 * @param props - The properties for configuring the mute button component.
 * @returns A `NubeComponentVideoMuteButton` object representing the mute button component.
 */
export const videoMuteButton = (
	props: NubeComponentVideoMuteButtonProps,
): NubeComponentVideoMuteButton => ({
	type: "videoMuteButton",
	...props,
	__internalId: generateInternalId("videoMuteButton", props),
});

/**
 * Creates a `videoIndicator` component.
 *
 * `Video.Indicator` renders its children only while the player of the
 * surrounding `Video.Root` is in `state` (`"playing"`, `"paused"`, `"muted"`
 * or `"unmuted"`). Inside a `Video.PlayButton` or `Video.MuteButton`, it swaps
 * the button's content per state.
 *
 * @param props - The properties for configuring the indicator component.
 * @returns A `NubeComponentVideoIndicator` object representing the indicator component.
 */
export const videoIndicator = (
	props: NubeComponentVideoIndicatorProps,
): NubeComponentVideoIndicator => ({
	type: "videoIndicator",
	...props,
	__internalId: generateInternalId("videoIndicator", props),
});
