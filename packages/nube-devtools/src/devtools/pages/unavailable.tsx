import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { NubeStatus } from "@/hooks/use-nube-status";
import { reloadInspectedTab } from "@/utils/inspected-tab";
import { BookOpenIcon, BugIcon, Loader2, RefreshCwIcon } from "lucide-react";

const DOCS_URL = "https://nuvemshop.dev/en-US/apps/nube-sdk/getting-started";
const ISSUES_URL = "https://github.com/TiendaNube/nube-sdk/issues/new/choose";

/**
 * Kept together, and out of the markup, so the strings can move to a
 * locale file without touching the component.
 */
const COPY = {
	checking: {
		title: "Waiting for NubeSDK",
		description:
			"The page is still loading. This panel opens on its own as soon as the NubeSDK runtime is ready.",
	},
	unavailable: {
		title: "NubeSDK not detected on this page",
		description:
			"The NubeSDK runtime has not loaded here. This panel keeps checking and opens on its own if it does.",
		causesTitle: "Common causes",
		causes: [
			"This page is not a Nuvemshop / Tiendanube store.",
			"The store has no NubeSDK app installed. Some themes only load NubeSDK once at least one app is installed.",
			"The app's script is not marked as “Uses NubeSDK” in the Partners Portal, or no version has been published.",
			"The store is not enabled for NubeSDK yet. Stores with open FTP access are not supported. Ask Tech Support to enable your test store, or open an issue.",
		],
		note: "While this extension is installed, it asks the store to load NubeSDK even when the store's own setting is off.",
	},
	actions: {
		reload: "Reload page",
		docs: "Documentation",
		issue: "Report an issue",
	},
} as const;

type UnavailableProps = {
	/** `available` never reaches this screen; it is typed out for clarity. */
	status: Exclude<NubeStatus, "available">;
};

export const Unavailable = ({ status }: UnavailableProps) => {
	const isChecking = status === "checking";
	const copy = isChecking ? COPY.checking : COPY.unavailable;

	return (
		<main className="min-h-full p-4">
			<div className="max-w-xl mx-auto">
				<div className="flex items-center gap-2 mb-3">
					<img src="/img/logo-32.png" alt="NubeSDK logo" className="w-5 h-5" />
					<h3 className="text-lg font-semibold">NubeSDK</h3>
				</div>
				<Card>
					<CardHeader>
						<CardTitle
							className={`flex items-center gap-2 text-base ${
								isChecking ? "" : "text-amber-600 dark:text-amber-400"
							}`}
						>
							{isChecking && (
								<Loader2 className="size-4 animate-spin text-muted-foreground" />
							)}
							{copy.title}
						</CardTitle>
						<CardDescription>{copy.description}</CardDescription>
					</CardHeader>
					{!isChecking && (
						<CardContent className="space-y-3 text-xs">
							<div className="space-y-1.5">
								<p className="text-[10px] uppercase tracking-wide text-muted-foreground">
									{COPY.unavailable.causesTitle}
								</p>
								<ul className="list-disc space-y-1 pl-4 text-muted-foreground">
									{COPY.unavailable.causes.map((cause) => (
										<li key={cause}>{cause}</li>
									))}
								</ul>
							</div>
							<p className="rounded border bg-muted/40 px-2 py-1.5 text-[11px] text-muted-foreground">
								{COPY.unavailable.note}
							</p>
						</CardContent>
					)}
				</Card>
				<div className="mt-3 flex flex-wrap items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						className="text-xs"
						onClick={() => void reloadInspectedTab()}
					>
						<RefreshCwIcon className="size-3" />
						{COPY.actions.reload}
					</Button>
					<Button variant="ghost" size="sm" className="text-xs" asChild>
						<a href={DOCS_URL} target="_blank" rel="noopener noreferrer">
							<BookOpenIcon className="size-3" />
							{COPY.actions.docs}
						</a>
					</Button>
					{!isChecking && (
						<Button variant="ghost" size="sm" className="text-xs" asChild>
							<a href={ISSUES_URL} target="_blank" rel="noopener noreferrer">
								<BugIcon className="size-3" />
								{COPY.actions.issue}
							</a>
						</Button>
					)}
				</div>
			</div>
		</main>
	);
};
