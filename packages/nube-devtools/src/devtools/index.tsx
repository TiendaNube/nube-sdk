import { DevToolsThemeProvider } from "@/contexts/devtools-theme-context";
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
