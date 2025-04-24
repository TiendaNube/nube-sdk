import { DevToolsThemeProvider } from "@/contexts/devtools-theme-context";
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./app";
import "./index.css";

ReactDOM.createRoot(document.getElementById("app") as HTMLElement).render(
	// <React.StrictMode>
	<DevToolsThemeProvider>
		<App />
	</DevToolsThemeProvider>,
	// </React.StrictMode>,
);

chrome.devtools.panels.create("NubeSDK", "", "../../devtools.html", () => {
	chrome.devtools.network.onNavigated.addListener((url: string) => {
		window.location.reload();
	});
});
