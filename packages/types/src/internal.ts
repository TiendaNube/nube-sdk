import type {
	NubeIframeMessageEventData,
	NubeNavigateEventData,
	NubeStorageEvent,
	NubeStorageEventData,
} from "./storage";

export type NubeSdkInternalEvent = NubeStorageEvent;

export type NubeSdkInternalEventData =
	| NubeStorageEventData
	| NubeNavigateEventData
	| NubeIframeMessageEventData;

export const NubeSdkInternalEventPrefix = "internal:";

export function isInternalEvent(event: string): event is NubeSdkInternalEvent {
	return event.startsWith(NubeSdkInternalEventPrefix);
}
