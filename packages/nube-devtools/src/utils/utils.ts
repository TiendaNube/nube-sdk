import type { BrowserTheme } from "@/contexts/devtools-theme-context";

/**
 * Gets the browser theme
 * @returns The browser theme
 */
export function getBrowserTheme(): BrowserTheme {
	return chrome.devtools.panels.themeName === "dark" ? "dark" : "light";
}
