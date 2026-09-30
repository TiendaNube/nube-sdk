import { DevToolsThemeProvider } from "@/contexts/devtools-theme-context";
import ReactDOM from "react-dom/client";
import { App } from "./app";
import "../styles/globals.css";
import "./index.css";

/**
 * Identifies the inspected document: `performance.timeOrigin` is fixed for a
 * document's lifetime and differs for every new one. Resolves `null` when the
 * page cannot be evaluated.
 */
const readDocumentOrigin = () =>
	new Promise<number | null>((resolve) => {
		chrome.devtools.inspectedWindow.eval<number>(
			"performance.timeOrigin",
			(result, exception) => {
				resolve(exception ? null : result);
			},
		);
	});

const documentOrigin = readDocumentOrigin();

// The providers snapshot the page once, on mount, so a new document needs a
// fresh panel. `onNavigated` also fires for same-document navigations, though
// — a theme pushing a hash or history entry when it opens the cart drawer —
// and reloading then would throw away the panel's history for nothing.
chrome.devtools.network.onNavigated.addListener(async () => {
	const [previous, current] = await Promise.all([
		documentOrigin,
		readDocumentOrigin(),
	]);

	if (previous !== null && previous === current) return;

	window.location.reload();
});

ReactDOM.createRoot(document.getElementById("app") as HTMLElement).render(
	// <React.StrictMode>
	<DevToolsThemeProvider>
		<App />
	</DevToolsThemeProvider>,
	// </React.StrictMode>,
);
