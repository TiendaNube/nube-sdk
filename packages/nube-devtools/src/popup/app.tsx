import { Toaster } from "@/components/ui/sonner";
import { DevToolsThemeProvider } from "@/contexts/devtools-theme-context";
import { Popup } from "./popup";

export function App() {
	return (
		<DevToolsThemeProvider>
			<Popup />
			<Toaster />
		</DevToolsThemeProvider>
	);
}
