import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Server } from "lucide-react";

export function LocalModeCardHeader() {
	return (
		<CardHeader className="text-center pb-1 px-3">
			<div className="flex justify-center mb-2">
				<div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
					<Server className="w-5 h-5 text-muted-foreground" />
				</div>
			</div>
			<CardTitle className="text-lg font-semibold text-card-foreground">
				Local Mode
			</CardTitle>
			<CardDescription className="text-muted-foreground text-xs">
				Connect your NubeSDK application to start debugging
			</CardDescription>
		</CardHeader>
	);
}
