import {
	handleEvents,
	highlightElement,
	injectWindowVariable,
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
	});
};

export const handleDevToolsInjectWindowVariable = (tabId: number) => {
	chrome.scripting.executeScript({
		target: { tabId },
		world: "MAIN",
		func: injectWindowVariable,
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
					return Object.keys(apps).reduce<
						Record<string, Record<string, NubeSDKComponent>>
					>((acc, appId) => {
						acc[appId] = apps[appId].ui.slots;
						return acc;
					}, {});
				}
				return {};
			},
		},
		(results) => {
			const components = results[0].result;
			if (components) {
				sendResponse({ status: true, components });
			} else {
				sendResponse({ status: true, components: {} });
			}
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
