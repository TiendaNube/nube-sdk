import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { NubeSDKEvent } from "@/contexts/nube-sdk-apps-context";

interface AppDetailsPanelProps {
	app: NubeSDKEvent;
}

export function AppDetailsPanel({ app }: AppDetailsPanelProps) {
	return (
		<div className="p-4">
			<div className="space-y-1 pb-4">
				<h4 className="text-sm font-medium leading-none">ID</h4>
				<Input
					className="w-auto"
					defaultValue={app.data.id}
					onClick={(e) => (e.target as HTMLInputElement).select()}
				/>
			</div>
			<div className="space-y-1 pb-4">
				<h4 className="text-sm font-medium leading-none">Registered</h4>
				<Input
					className="w-auto"
					defaultValue={app.data.registered ? "true" : "false"}
					onClick={(e) => (e.target as HTMLInputElement).select()}
				/>
			</div>
			<div className="space-y-1">
				<h4 className="text-sm font-medium leading-none">Script</h4>
				<div className="flex items-center gap-2">
					<Textarea
						className="w-auto max-w-[300px]"
						defaultValue={app.data.script}
						onClick={(e) => (e.target as HTMLTextAreaElement).select()}
					/>
				</div>
			</div>
		</div>
	);
}
