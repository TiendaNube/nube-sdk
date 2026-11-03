import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Divider } from "@/components/ui/divider";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import Layout from "@/devtools/components/layout";
import { useDevToolsSettings } from "@/hooks/use-devtools-settings";
import { changesPageLoad, isValidSdkUrl } from "@/utils/settings";
import { RotateCw, SettingsIcon } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { toast } from "sonner";

const SettingRow = ({
	id,
	title,
	description,
	checked,
	disabled,
	onCheckedChange,
	children,
}: {
	id: string;
	title: string;
	description: ReactNode;
	checked: boolean;
	disabled?: boolean;
	onCheckedChange: (checked: boolean) => void;
	children?: ReactNode;
}) => (
	<div className="flex items-start gap-3 py-3">
		<Switch
			id={id}
			checked={checked}
			disabled={disabled}
			onCheckedChange={onCheckedChange}
			className="mt-0.5"
		/>
		<div className="flex-1 min-w-0 space-y-1">
			<label
				htmlFor={id}
				className={`text-sm font-medium ${disabled ? "opacity-50" : ""}`}
			>
				{title}
			</label>
			<p className="text-xs text-muted-foreground">{description}</p>
			{children}
		</div>
	</div>
);

export function SettingsPage() {
	const { settings, update } = useDevToolsSettings();
	const [sdkUrl, setSdkUrl] = useState("");

	// Follows the saved URL (on load, and when it changes elsewhere).
	const savedSdkUrl = settings?.sdkUrl;
	useEffect(() => {
		if (savedSdkUrl !== undefined) setSdkUrl(savedSdkUrl);
	}, [savedSdkUrl]);

	// Reloads the inspected page when the change affects how it loads. `update`
	// resolves once the new rules are in place, so the reload already uses them.
	const save = (changes: Parameters<typeof update>[0]) => {
		const before = settings;
		update(changes)
			.then((after) => {
				if (before && changesPageLoad(before, after)) {
					chrome.devtools.inspectedWindow.reload();
				}
			})
			.catch((error) => {
				toast.error("Could not save the settings", {
					description: String(error),
				});
			});
	};

	const trimmedUrl = sdkUrl.trim();
	const urlIsValid = isValidSdkUrl(trimmedUrl);
	const urlError = trimmedUrl !== "" && !urlIsValid;

	// Saved when it is valid; an invalid one stays local and keeps the last saved URL.
	const saveUrl = () => {
		if (settings && urlIsValid && trimmedUrl !== settings.sdkUrl) {
			save({ sdkUrl: trimmedUrl });
		}
	};

	return (
		<Layout>
			<div className="flex h-full flex-col">
				<nav className="flex items-center justify-between px-1.5 py-1 border-b h-[33px] shrink-0">
					<div className="flex items-center min-w-0">
						<SidebarTrigger />
						<Divider />
						<SettingsIcon className="size-3 shrink-0" />
						<span className="ml-1.5 text-xs font-medium">Settings</span>
						<span className="ml-2 text-xs text-muted-foreground truncate hidden sm:inline">
							Apply to every website. Changes reload the page
						</span>
					</div>
					<Button
						variant="ghost"
						size="sm"
						className="h-6 text-xs"
						onClick={() => chrome.devtools.inspectedWindow.reload()}
					>
						<RotateCw className="size-3" />
						Reload page
					</Button>
				</nav>
				<div className="flex-1 overflow-y-auto p-4 flex justify-center">
					{settings && (
						<Card className="w-full max-w-lg border-border bg-card">
							<CardContent className="px-4 divide-y">
								<SettingRow
									id="setting-force-sdk"
									title="Force NubeSDK active"
									description="Forces NubeSDK active even in stores that don't have any apps. Warning: This will bypass caches, and should not be used when doing performance tests."
									checked={settings.forceSdk}
									// Turning it off also turns off Load SDK From URL.
									onCheckedChange={(checked) =>
										save(
											checked
												? { forceSdk: true }
												: { forceSdk: false, forceSdkFromUrl: false },
										)
									}
								/>
								<SettingRow
									id="setting-force-sdk-from-url"
									title="Load NubeSDK From URL"
									description="Loads the NubeSDK from the specified location instead of the production URL."
									checked={settings.forceSdkFromUrl}
									disabled={!urlIsValid}
									onCheckedChange={(checked) =>
										save({ forceSdkFromUrl: checked, sdkUrl: trimmedUrl })
									}
								>
									<Input
										type="url"
										aria-label="vanilla-adapter URL"
										aria-invalid={urlError}
										placeholder="https://nsk-cdn-static.tiendanube.com/vanilla-adapter-<version>.min.js"
										value={sdkUrl}
										onChange={(event) => setSdkUrl(event.target.value)}
										onBlur={saveUrl}
										onKeyDown={(event) => {
											if (event.key === "Enter") saveUrl();
										}}
										className="mt-2 h-8 font-mono text-xs"
									/>
									{urlError && (
										<p className="text-xs text-destructive">
											Enter an http or https URL.
										</p>
									)}
								</SettingRow>
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		</Layout>
	);
}
