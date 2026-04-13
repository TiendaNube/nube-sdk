import type { BrowserTheme } from "@/contexts/devtools-theme-context";

export function getBrowserTheme(): BrowserTheme {
	try {
		return chrome.devtools.panels.themeName === "dark" ? "dark" : "light";
	} catch {
		return window.matchMedia("(prefers-color-scheme: dark)").matches
			? "dark"
			: "light";
	}
}
