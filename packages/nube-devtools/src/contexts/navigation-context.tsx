import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import type { ReactNode } from "react";

export const PAGES = {
	EVENTS: "events",
	LOGS: "logs",
	STORAGES: "storages",
	APPS: "apps",
	LOCAL_MODE: "local-mode",
	COMPONENTS: "components",
	SIGNALS: "signals",
	SVG_CONVERT: "svg-convert",
	STATE: "state",
	API_CALLS: "api-calls",
	PERFORMANCE: "performance",
} as const;

export type Page = (typeof PAGES)[keyof typeof PAGES];

/**
 * Something a page asks another to select when it opens: a component (by the
 * key of its node in the page view) or a signal (by its id).
 */
export type NavigationFocus = { page: Page; target: string };

type NavigationContextType = {
	currentPage: Page;
	/** Opens `page`, optionally asking it to select `target`. */
	navigate: (page: Page, target?: string) => void;
	/** What the current page was asked to select, until it takes it. */
	focus: NavigationFocus | null;
	clearFocus: () => void;
};

const NavigationContext = createContext<NavigationContextType | undefined>(
	undefined,
);

export function NavigationProvider({ children }: { children: ReactNode }) {
	const [currentPage, setCurrentPage] = useState<Page>(() => {
		const stored = localStorage.getItem("currentPage");
		// The Logs page replaced the Errors page: keep the panel where it was.
		const savedPage = stored === "errors" ? PAGES.LOGS : stored;
		return Object.values(PAGES).includes(savedPage as Page)
			? (savedPage as Page)
			: PAGES.APPS;
	});

	useEffect(() => {
		localStorage.setItem("currentPage", currentPage);
	}, [currentPage]);

	const [focus, setFocus] = useState<NavigationFocus | null>(null);

	const navigate = useCallback((page: Page, target?: string) => {
		setFocus(target === undefined ? null : { page, target });
		setCurrentPage(page);
	}, []);

	const clearFocus = useCallback(() => setFocus(null), []);

	return (
		<NavigationContext.Provider
			value={{ currentPage, navigate, focus, clearFocus }}
		>
			{children}
		</NavigationContext.Provider>
	);
}

export function useNavigation() {
	const context = useContext(NavigationContext);
	if (context === undefined) {
		throw new Error("useNavigation must be used within a NavigationProvider");
	}
	return context;
}
