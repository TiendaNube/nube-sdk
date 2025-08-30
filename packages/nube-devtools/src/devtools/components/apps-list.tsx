import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableRow } from "@/components/ui/table";
import {
	type NubeSDKEvent,
	useNubeSDKAppsContext,
} from "@/contexts/nube-sdk-apps-context";
import { Loader2 } from "lucide-react";
import { TableRowItem } from "./table-row-item";

interface AppsListProps {
	apps: NubeSDKEvent[];
	selectedApp: NubeSDKEvent | null;
	onSelect: (app: NubeSDKEvent) => void;
	onReload: () => void;
	isLoading: boolean;
}

export function AppsList({
	apps,
	selectedApp,
	onSelect,
	onReload,
	isLoading,
}: AppsListProps) {
	console.log("🚀 ~ apps:", apps);
	const { markAsShown } = useNubeSDKAppsContext();
	const isDevMode = (script: string) => {
		return script.includes("localhost") || script.includes("127.0.0.1");
	};

	if (isLoading) {
		return (
			<div className="flex h-full items-center justify-center">
				<Loader2 className="h-6 w-6 animate-spin" />
			</div>
		);
	}

	if (apps.length === 0) {
		return (
			<div className="flex h-full flex-col items-center justify-center gap-2">
				<p className="text-sm">No apps found</p>
				<Button
					variant="outline"
					size="sm"
					className="h-5 px-2 text-xs"
					onClick={onReload}
				>
					Reload page
				</Button>
			</div>
		);
	}

	return (
		<Table>
			<TableBody>
				{apps.map((app) => (
					<TableRow key={app.id}>
						<TableRowItem
							isSelected={app.id === selectedApp?.id}
							data={app}
							onSelect={onSelect}
							onShow={() => markAsShown(app.id)}
						>
							<div className="flex items-center gap-1">
								<span>{app.data.id}</span>
								{isDevMode(app.data.script) && (
									<Badge className="text-[10px] px-1 py-0.5" variant="outline">
										dev mode
									</Badge>
								)}
							</div>
						</TableRowItem>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
