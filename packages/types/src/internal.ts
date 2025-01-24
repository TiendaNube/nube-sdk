import {
	NubeLocalStorageGetEvent,
	type NubeLocalStorageGetEventData,
	NubeLocalStorageGetResponseEvent,
	type NubeLocalStorageGetResponseEventData,
	NubeLocalStorageRemoveEvent,
	type NubeLocalStorageRemoveEventData,
	NubeLocalStorageSetEvent,
	type NubeLocalStorageSetEventData,
} from "./localstorage";

export type NubeSdkInternalEvent =
	| typeof NubeLocalStorageGetEvent
	| typeof NubeLocalStorageGetResponseEvent
	| typeof NubeLocalStorageSetEvent
	| typeof NubeLocalStorageRemoveEvent;

export type NubeSdkInternalEventData =
	| NubeLocalStorageGetEventData
	| NubeLocalStorageGetResponseEventData
	| NubeLocalStorageSetEventData
	| NubeLocalStorageRemoveEventData;

export const NubeSdkInternalEventIds = [
	NubeLocalStorageGetEvent,
	NubeLocalStorageGetResponseEvent,
	NubeLocalStorageSetEvent,
	NubeLocalStorageRemoveEvent,
];
