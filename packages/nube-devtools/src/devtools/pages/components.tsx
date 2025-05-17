import type { NubeSDKComponent } from "@/background/types";
import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { RefreshCcw, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Layout from "@/devtools/components/layout";
import { TreeView } from "@/devtools/components/tree-view";
import { useGetComponents } from "@/hooks/use-get-components";
import { EmptyState } from "@/devtools/components/empty-state";

type ComponentsData = {
	[key: string]: Record<string, NubeSDKComponent>;
};

const useComponents = () => {
	const [apps, setApps] = useState<string[]>([]);
	const [selectedApp, setSelectedApp] = useState<string | null>(null);
	const { components, refresh, isLoading } = useGetComponents();

	useEffect(() => {
		const keys = Object.keys(components);
		if (keys.length === 1) {
			setSelectedApp(keys[0]);
		} else {
			setApps(keys);
		}
	}, [components]);

	return {
		apps,
		selectedApp,
		components,
		setSelectedApp,
		refresh,
		isLoading,
	};
};

const ComponentsNav = ({
	selectedApp,
	components,
	onRefresh,
}: {
	selectedApp: string | null;
	components: ComponentsData;
	onRefresh: () => void;
}) => (
	<nav className="flex items-center px-1.5 justify-between py-1 border-b h-[33px]">
		<div className="flex items-center">
			<SidebarTrigger />
			<Divider />
			<Button
				variant="ghost"
				size="icon"
				className="h-6 w-6"
				onClick={() => {
					onRefresh();
					toast.success("Components refreshed");
				}}
			>
				<RefreshCcw className="size-3" />
			</Button>
		</div>
		{selectedApp && (
			<span className="text-xs">
				{Object.keys(components[selectedApp]).length}{" "}
				{Object.keys(components[selectedApp]).length === 1 ? "slot" : "slots"}
			</span>
		)}
	</nav>
);

export function Components() {
	const { apps, selectedApp, components, setSelectedApp, refresh, isLoading } =
		useComponents();

	if (isLoading) {
		return (
			<Layout>
				<div className="flex items-center justify-center h-full">
					<Loader2 className="h-6 w-6 animate-spin" />
				</div>
			</Layout>
		);
	}

	return (
		<Layout>
			<ComponentsNav
				selectedApp={selectedApp}
				components={components}
				onRefresh={refresh}
			/>
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
			{Object.keys(components).length === 0 && !isLoading && (
				<EmptyState
					text="No components found"
					buttonText="Refresh"
					onButtonClick={refresh}
				/>
			)}
		</Layout>
	);
}
