import type { NubeSDKComponent } from "@/background/types";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { RefreshCcw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import Layout from "../components/layout";
import { TreeView } from "../components/tree-view";

export function Components() {
	const [apps, setApps] = useState<string[]>([]);
	const [selectedApp, setSelectedApp] = useState<string | null>(null);
	const [components, setComponents] = useState<{
		[key: string]: Record<string, NubeSDKComponent>;
	}>({});

	const getComponents = useCallback(() => {
		chrome.runtime.sendMessage(
			{
				action: "nube-devtools-fetch-components",
				payload: {
					tabId: chrome.devtools.inspectedWindow.tabId,
				},
			},
			(response: {
				status: boolean;
				components: {
					[key: string]: Record<string, NubeSDKComponent>;
				};
			}) => {
				if (response.status && response.components) {
					const keys = Object.keys(response.components);
					setComponents(response.components);
					if (keys.length === 1) {
						setSelectedApp(keys[0]);
					} else {
						setApps(keys);
					}
				}
			},
		);
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		getComponents();
	}, []);

	return (
		<Layout>
			<nav className="flex items-center px-1.5 justify-between py-1 border-b h-[33px]">
				<div className="flex items-center">
					<SidebarTrigger />
					<div className="h-4 w-px bg-neutral-600 mx-2" />
					<Button
						variant="ghost"
						size="icon"
						className="h-6 w-6"
						onClick={() => {
							getComponents();
							toast.success("Components refreshed");
						}}
					>
						<RefreshCcw className="size-3" />
					</Button>
				</div>
				{selectedApp && (
					<span className="text-xs">
						{Object.keys(components[selectedApp]).length}{" "}
						{Object.keys(components[selectedApp]).length === 1
							? "slot"
							: "slots"}
					</span>
				)}
			</nav>
			{selectedApp && <TreeView data={components[selectedApp]} />}
			{apps.length > 0 && !selectedApp && (
				<div className="pl-4 pt-4">
					<Select onValueChange={(value) => setSelectedApp(value)}>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Select app" />
							<SelectContent>
								{apps.map((appId) => (
									<SelectItem key={appId} value={appId}>
										{appId}
									</SelectItem>
								))}
							</SelectContent>
						</SelectTrigger>
					</Select>
				</div>
			)}
		</Layout>
	);
}
