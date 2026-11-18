import type { NubeSignalsEvent, NubeSignalsEventData } from "./signals";
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

export type NubeSdkInternalEvent = NubeStorageEvent | NubeSignalsEvent;

export type NubeSdkInternalEventData =
	| NubeStorageEventData
	| NubeNavigateEventData
	| NubeIframeMessageEventData
	| NubeFormActionEventData
	| NubeFormFileGetEventData
	| NubeFormFileGetResponseEventData
	| NubeScrollToEventData
	| NubeSignalsEventData;

export const NubeSdkInternalEventPrefix = "internal:";

export function isInternalEvent(event: string): event is NubeSdkInternalEvent {
	return event.startsWith(NubeSdkInternalEventPrefix);
}
