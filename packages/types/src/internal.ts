import type { NubeNavigateEventData, NubeStorageEvent, NubeStorageEventData } from "./storage";

export type NubeSdkInternalEvent = NubeStorageEvent;

export type NubeSdkInternalEventData = NubeStorageEventData | NubeNavigateEventData;

export const NubeSdkInternalEventPrefix = "internal:";

export function isInternalEvent(event: string): event is NubeSdkInternalEvent {
	return event.startsWith(NubeSdkInternalEventPrefix);
}
