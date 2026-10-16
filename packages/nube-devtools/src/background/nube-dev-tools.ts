import { MAX_COMMAND_RECORDS } from "../utils/page-commands";
import { MAX_EVENT_RECORDS } from "../utils/page-events";
import { MAX_LOG_RECORDS } from "../utils/page-logs";
import { STORAGE_KEY_PATTERN_SOURCE } from "../utils/storage-key";
import { handleCommands, handleEvents, resendEvent } from "./scripts";
import type { NubeSDKState } from "./types";

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
		// format and the history bounds have to be handed over explicitly.
		args: [STORAGE_KEY_PATTERN_SOURCE, MAX_EVENT_RECORDS, MAX_LOG_RECORDS],
	});
	await chrome.scripting.executeScript({
		target: { tabId },
		world: "MAIN",
		func: handleCommands,
		args: [MAX_COMMAND_RECORDS],
	});
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
