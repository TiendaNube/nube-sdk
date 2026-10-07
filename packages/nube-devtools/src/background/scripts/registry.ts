import { getApps } from "./get-apps";
import { clearCommands, readCommands } from "./page-commands";
import { clearEvents, readEvents } from "./page-events";
import { clearPerformance, readPerformance } from "./page-performance";
import {
	getStorageItem,
	readStorage,
	removeStorage,
	writeStorage,
} from "./page-storage";

/**
 * The functions the panel can run in the inspected page through the
 * background.
 *
 * Firefox does not expose `scripting` to devtools pages, so there the panel
 * asks the background to run them instead. A function cannot travel in a
 * runtime message, so it is sent by its key here, which both sides import.
 */
export const PAGE_SCRIPTS = {
	clearCommands,
	clearEvents,
	clearPerformance,
	getApps,
	getStorageItem,
	readCommands,
	readEvents,
	readPerformance,
	readStorage,
	removeStorage,
	writeStorage,
} as const;

export type PageScriptName = keyof typeof PAGE_SCRIPTS;
