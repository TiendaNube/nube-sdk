import { MAX_COMMAND_RECORDS } from "../utils/page-commands";
import { MAX_EVENT_RECORDS } from "../utils/page-events";
import { STORAGE_KEY_PATTERN_SOURCE } from "../utils/storage-key";
import {
	handleCommands,
	handleEvents,
	highlightElement,
	resendEvent,
	scrollToElement,
} from "./scripts";
import type { NubeSDKComponent, NubeSDKState } from "./types";

type HandleDevToolsResendEventParams = {
	state: NubeSDKState;
	event: string;
	appId: string;
	tabId: number;
};

export const handleDevToolsVerifyNubeSdkStatus = ({
	sendResponse,
	tabId,
}: {
	sendResponse: (response: { status: boolean }) => void;
	tabId: number;
}) => {
	chrome.scripting.executeScript(
		{
			target: { tabId },
			world: "MAIN",
			func: () => {
				return !!window.nubeSDK;
			},
		},
		(results) => {
			try {
				const status = results?.[0]?.result;
				sendResponse({ status });
			} catch (error) {
				sendResponse({ status: false });
			}
		},
	);
};

export const handleDevToolsEvents = async ({ tabId }: { tabId: number }) => {
	await chrome.scripting.executeScript({
		target: { tabId },
		world: "MAIN",
		func: handleEvents,
		// The injected function is serialized without its scope, so the key
		// format and the history bound have to be handed over explicitly.
		args: [STORAGE_KEY_PATTERN_SOURCE, MAX_EVENT_RECORDS],
	});
	await chrome.scripting.executeScript({
		target: { tabId },
		world: "MAIN",
		func: handleCommands,
		args: [MAX_COMMAND_RECORDS],
	});
};

export const handleDevToolsGetComponents = ({
	tabId,
	sendResponse,
}: {
	tabId: number;
	sendResponse: (response: {
		status: boolean;
		components?: {
			[key: string]: Record<string, NubeSDKComponent>;
		};
	}) => void;
}) => {
	chrome.scripting.executeScript(
		{
			target: { tabId },
			world: "MAIN",
			func: () => {
				if (window.nubeSDK) {
					const apps = window.nubeSDK.getState().apps;
					const slotsByApp = Object.keys(apps).reduce<
						Record<string, Record<string, NubeSDKComponent>>
					>((acc, appId) => {
						const slots = apps[appId]?.ui?.slots;
						if (slots) {
							acc[appId] = slots;
						}
						return acc;
					}, {});
					// Chrome serializes the result as JSON and drops what it
					// cannot represent; Firefox uses structured clone and fails
					// the whole call on a function in the props. Serializing here
					// gives both the same result.
					return JSON.parse(JSON.stringify(slotsByApp));
				}
				return {};
			},
		},
		(results) => {
			const components = results?.[0]?.result;
			sendResponse({ status: true, components: components ?? {} });
		},
	);
};

export const handleDevToolsResendEvent = (
	sendResponse: (response: { status: boolean }) => void,
	{ state, event, appId, tabId }: HandleDevToolsResendEventParams,
) => {
	chrome.scripting.executeScript(
		{
			target: { tabId },
			world: "MAIN",
			func: resendEvent,
			args: [appId, state, event],
		},
		(results) => {
			const success = results?.[0]?.result === true;
			sendResponse({ status: success });
		},
	);
};

export const handleDevToolsHighlightElement = ({
	tabId,
	id,
	title,
	type,
	color,
	sendResponse,
}: {
	tabId: number;
	id: string;
	title: string;
	type: "enter" | "leave";
	color: "green" | "blue";
	sendResponse: (response: { status: boolean }) => void;
}) => {
	chrome.scripting.executeScript(
		{
			target: { tabId },
			world: "MAIN",
			func: highlightElement,
			args: [id, type, color, title],
		},
		() => {
			try {
				sendResponse({ status: true });
			} catch (error) {
				sendResponse({ status: false });
			}
		},
	);
};

export const handleDevToolsScrollToElement = ({
	tabId,
	id,
	sendResponse,
}: {
	tabId: number;
	id: string;
	sendResponse: (response: { status: boolean }) => void;
}) => {
	chrome.scripting.executeScript(
		{
			target: { tabId },
			world: "MAIN",
			func: scrollToElement,
			args: [id],
		},
		() => {
			try {
				sendResponse({ status: true });
			} catch (error) {
				sendResponse({ status: false });
			}
		},
	);
};
