import type { DevModeConfig } from "../devtools/pages/dev-mode";
import { checkDevScript, registerDevApp } from "./scripts";

/**
 * Monitor of dev mode that checks and applies configurations automatically
 */
export class DevModeMonitor {
	private static instance: DevModeMonitor;
	private currentConfig: DevModeConfig | null = null;
	private monitorInterval: NodeJS.Timeout | null = null;

	static getInstance(): DevModeMonitor {
		if (!DevModeMonitor.instance) {
			DevModeMonitor.instance = new DevModeMonitor();
		}
		return DevModeMonitor.instance;
	}

	/**
	 * Start monitoring the dev mode configurations
	 */
	start() {
		if (this.monitorInterval) return; // already running

		this.loadAndApplyConfig();

		// Monitor changes every 5 seconds
		this.monitorInterval = setInterval(() => {
			this.loadAndApplyConfig();
		}, 5_000);
	}

	/**
	 * Stop monitoring
	 */
	stop() {
		if (this.monitorInterval) {
			clearInterval(this.monitorInterval);
			this.monitorInterval = null;
		}
	}

	/**
	 * Apply a new configuration immediately
	 */
	async applyConfig(config: DevModeConfig) {
		console.log("⚙️ Applying new dev mode configuration:", config);
		this.currentConfig = config;

		if (config.isEnabled) {
			await this.ensureDevAppRegistered(config.scriptUrl);
		}

		// Force update the data in the tabs
		this.refreshExtensionData();
	}

	/**
	 * Load configuration from localStorage and apply if necessary
	 */
	private async loadAndApplyConfig() {
		try {
			// Search for any open devtools tab
			const tabs = await chrome.tabs.query({});
			for (const tab of tabs) {
				if (tab.id) {
					try {
						const result = await chrome.scripting.executeScript({
							target: { tabId: tab.id },
							world: "ISOLATED",
							func: () => {
								return localStorage.getItem("nube-devtools-dev-mode-config");
							},
						});

						const configString = result[0]?.result;
						if (configString) {
							const config: DevModeConfig = JSON.parse(configString);

							// Apply only if the configuration has changed
							if (
								!this.currentConfig ||
								this.currentConfig.isEnabled !== config.isEnabled ||
								this.currentConfig.scriptUrl !== config.scriptUrl
							) {
								await this.applyConfig(config);
							}
							return; // Configuration found, stop searching
						}
					} catch (error) {
						// Ignore errors from tabs that cannot execute scripts
					}
				}
			}
		} catch (error) {
			console.error("Error loading dev mode configuration:", error);
		}
	}

	/**
	 * Ensure that the development app is registered
	 */
	private async ensureDevAppRegistered(scriptUrl: string) {
		try {
			const tabs = await chrome.tabs.query({});

			for (const tab of tabs) {
				if (tab.id && tab.url && /^https?:\/\//i.test(tab.url)) {
					// Check if the script is already loaded
					const isLoaded = await this.checkIfScriptLoaded(tab.id, scriptUrl);

					if (!isLoaded) {
						// Register the app if it is not loaded
						const ok = await this.registerDevApp(tab.id, scriptUrl);
						if (!ok) {
							console.error(
								`Failed to register development app in tab ${tab.id}`,
							);
						}
					}
				}
			}
		} catch (error) {
			console.error("Error ensuring development app registration:", error);
		}
	}

	/**
	 * Check if the script is loaded in a specific tab
	 */
	private async checkIfScriptLoaded(
		tabId: number,
		scriptUrl: string,
	): Promise<boolean> {
		return new Promise((resolve) => {
			chrome.scripting.executeScript(
				{
					target: { tabId },
					world: "MAIN",
					func: checkDevScript,
					args: [scriptUrl],
				},
				(results) => {
					resolve(results?.[0]?.result === true);
				},
			);
		});
	}

	/**
	 * Register the development app in a specific tab
	 */
	private async registerDevApp(
		tabId: number,
		scriptUrl: string,
	): Promise<boolean> {
		return new Promise((resolve) => {
			chrome.scripting.executeScript(
				{
					target: { tabId },
					world: "MAIN",
					func: registerDevApp,
					args: [scriptUrl],
				},
				(results) => {
					resolve(results?.[0]?.result === true);
				},
			);
		});
	}

	/**
	 * Force update the data in the extension tabs
	 */
	private refreshExtensionData() {
		console.log("Updating extension data after dev mode change");

		// Send message to all devtools tabs
		chrome.runtime
			.sendMessage({
				action: "nube-devtools-refresh-data",
			})
			.catch(() => {
				// Ignore errors if there is no receiver
			});
	}
}
