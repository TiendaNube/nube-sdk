import { AUTO_SLOTS_FLAG_GLOBAL } from "@/utils/auto-slots";
import {
	type ReactNode,
	createContext,
	useContext,
	useEffect,
	useState,
} from "react";

const RETRY_DELAY_MS = 500;
const MAX_ATTEMPTS = 20;

type FlagCheck = { flagged: boolean; loaded: boolean };

const FLAG_EXPRESSION = `({ flagged: window.${AUTO_SLOTS_FLAG_GLOBAL} === true, loaded: document.readyState === "complete" })`;

const AutoSlotsContext = createContext<boolean | null>(null);

/**
 * Whether the inspected page runs the auto-slots adapter, which flags itself
 * when it loads: null while checking. The adapter loads async, so until the
 * page has loaded a missing flag is checked again. The panel reloads on
 * navigation, so a new page gets a new check.
 */
export function AutoSlotsProvider({ children }: { children: ReactNode }) {
	const [autoSlots, setAutoSlots] = useState<boolean | null>(null);

	useEffect(() => {
		let attempts = 0;
		let timer: ReturnType<typeof setTimeout> | undefined;
		let active = true;

		const check = () => {
			attempts++;
			chrome.devtools.inspectedWindow.eval<FlagCheck>(
				FLAG_EXPRESSION,
				(result, exception) => {
					if (!active) return;
					if (!exception && result?.flagged) {
						setAutoSlots(true);
					} else if (!exception && !result?.loaded && attempts < MAX_ATTEMPTS) {
						timer = setTimeout(check, RETRY_DELAY_MS);
					} else {
						setAutoSlots(false);
					}
				},
			);
		};
		check();

		return () => {
			active = false;
			clearTimeout(timer);
		};
	}, []);

	return (
		<AutoSlotsContext.Provider value={autoSlots}>
			{children}
		</AutoSlotsContext.Provider>
	);
}

/** Whether the inspected page runs the auto-slots adapter: null while checking. */
export function useAutoSlotsFlag() {
	return useContext(AutoSlotsContext);
}
