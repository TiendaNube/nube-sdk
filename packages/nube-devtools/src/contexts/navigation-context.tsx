import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

export const PAGES = {
	EVENTS: "events",
	STORAGES: "storages",
	APPS: "apps",
	COMPONENTS: "components",
	SVG_CONVERT: "svg-convert",
} as const;

export type Page = (typeof PAGES)[keyof typeof PAGES];

type NavigationContextType = {
	currentPage: Page;
	navigate: (page: Page) => void;
};

const NavigationContext = createContext<NavigationContextType | undefined>(
	undefined,
);

export function NavigationProvider({ children }: { children: ReactNode }) {
	const [currentPage, setCurrentPage] = useState<Page>(() => {
		const savedPage = localStorage.getItem("currentPage");
		return Object.values(PAGES).includes(savedPage as Page)
			? (savedPage as Page)
			: PAGES.APPS;
	});

	useEffect(() => {
		localStorage.setItem("currentPage", currentPage);
	}, [currentPage]);

	const navigate = (page: Page) => {
		setCurrentPage(page);
	};

	return (
		<NavigationContext.Provider value={{ currentPage, navigate }}>
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
