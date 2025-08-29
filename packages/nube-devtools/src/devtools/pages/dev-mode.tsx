import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Layout from "@/devtools/components/layout";
import { useEffect, useState } from "react";

const DEV_MODE_DEFAULT_URL = "http://localhost:8080/main.min.js";
export const DEV_MODE_STORAGE_KEY = "nube-devtools-dev-mode-config";

export interface DevModeConfig {
	isEnabled: boolean;
	scriptUrl: string;
}

export function DevMode() {
	const [isDevModeEnabled, setIsDevModeEnabled] = useState(false);
	const [scriptUrl, setScriptUrl] = useState(DEV_MODE_DEFAULT_URL);

	// Load saved configuration
	useEffect(() => {
		try {
			const savedConfig = localStorage.getItem(DEV_MODE_STORAGE_KEY);
			if (savedConfig) {
				const config: DevModeConfig = JSON.parse(savedConfig);
				setScriptUrl(config.scriptUrl || DEV_MODE_DEFAULT_URL);
			}
		} catch (error) {
			console.error("Error loading dev mode configuration:", error);
		}
	}, []);

	// Save configuration and notify background
	const saveConfigAndNotify = (newConfig: DevModeConfig) => {
		try {
			localStorage.setItem(DEV_MODE_STORAGE_KEY, JSON.stringify(newConfig));

			// Notify background script about the change
			chrome.runtime.sendMessage({
				action: "nube-devtools-dev-mode-config-changed",
				payload: newConfig,
			});
		} catch (error) {
			console.error("Error saving dev mode configuration:", error);
		}
	};

	const handleToggleDevMode = (enabled: boolean) => {
		setIsDevModeEnabled(enabled);
		const newConfig: DevModeConfig = {
			isEnabled: enabled,
			scriptUrl: scriptUrl,
		};
		saveConfigAndNotify(newConfig);
	};

	const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newUrl = e.target.value;
		setScriptUrl(newUrl);
		const newConfig: DevModeConfig = {
			isEnabled: isDevModeEnabled,
			scriptUrl: newUrl,
		};
		saveConfigAndNotify(newConfig);
	};

	return (
		<Layout>
			<div className="flex h-full flex-col">
				<nav className="flex items-center justify-between px-1.5 py-1 border-b h-[33px] shrink-0">
					<div className="flex items-center gap-2">
						<SidebarTrigger />
					</div>
				</nav>

				<div className="flex-1 p-6">
					<Card>
						<CardHeader className="pb-4">
							<div className="flex items-center justify-between">
								<div>
									<CardTitle className="text-lg">Development Mode</CardTitle>
									<CardDescription>
										Configure local development settings
									</CardDescription>
								</div>
								<Button
									id="dev-mode"
									variant={isDevModeEnabled ? "default" : "outline"}
									size="sm"
									onClick={() => handleToggleDevMode(!isDevModeEnabled)}
								>
									{isDevModeEnabled ? "Enabled" : "Disabled"}
								</Button>
							</div>
						</CardHeader>
						<CardContent className="space-y-6">
							{/* Script URL Configuration */}
							<div className="space-y-3">
								<Label htmlFor="script-url" className="text-sm font-medium">
									Script URL
								</Label>
								<Input
									id="script-url"
									type="url"
									value={scriptUrl}
									onChange={handleUrlChange}
									disabled={!isDevModeEnabled}
									placeholder={DEV_MODE_DEFAULT_URL}
									className="font-mono text-sm"
								/>
								<div className="flex items-center gap-2 text-xs text-muted-foreground">
									<span className="w-2 h-2 rounded-full bg-green-500" />
									Changes are applied automatically
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</Layout>
	);
}
