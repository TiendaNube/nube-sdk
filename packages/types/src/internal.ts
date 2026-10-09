import type {
	NubeFormActionEventData,
	NubeFormFileGetEventData,
	NubeFormFileGetResponseEventData,
	NubeIframeMessageEventData,
	NubeNavigateEventData,
	NubeScrollToEventData,
	NubeStorageEvent,
	NubeStorageEventData,
} from "./storage";

export type NubeSdkInternalEvent = NubeStorageEvent;

export type NubeSdkInternalEventData =
	| NubeStorageEventData
	| NubeNavigateEventData
	| NubeIframeMessageEventData
	| NubeFormActionEventData
	| NubeFormFileGetEventData
	| NubeFormFileGetResponseEventData
	| NubeScrollToEventData;

export const NubeSdkInternalEventPrefix = "internal:";

export function isInternalEvent(event: string): event is NubeSdkInternalEvent {
	return event.startsWith(NubeSdkInternalEventPrefix);
}
