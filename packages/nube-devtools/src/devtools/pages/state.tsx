import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { JsonViewer } from "@/devtools/components/json-viewer";
import Layout from "../components/layout";
import { RefreshCwIcon } from "lucide-react";
import type { NubeSDKState } from "@tiendanube/nube-sdk-types";
import type { NubeSDKEventData } from "@/contexts/nube-sdk-events-context";

export function State() {
	const [state, setState] = useState<NubeSDKState | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

  useEffect(() => {
		const listener = (port: chrome.runtime.Port) => {
			if (port.name === "nube-devtools-events") {
				port.onMessage.addListener((message) => {
					console.log("🚀 ~ listener ~ message.payload:", message.payload[0])
					if (message.payload as NubeSDKEventData) {
            setState(message.payload[0]);
						port.disconnect();
					}
				});
			}
		};

		chrome.runtime.onConnect.addListener(listener);

		return () => {
			chrome.runtime.onConnect.removeListener(listener);
		};
	}, []);

	const fetchState = useCallback(() => {
		setLoading(true);
		setError(null);

		chrome.devtools.inspectedWindow.eval(
			'window.nubeSDK?.getState?.()',
			(result, isException) => {
				setLoading(false);

				if (isException || !result || (typeof result === "object" && Object.keys(result).length === 0)) {
					setError(
						isException?.value || "nubeSDK.getState() not found or returned null"
					);
					setState(null);
				} else {
					setState(result as NubeSDKState);
				}
			}
		);
	}, []);

	useEffect(() => {
		fetchState();
	}, [fetchState]);

	return (
		<Layout>
			<div className="flex h-full flex-col">
				<nav className="flex items-center px-1.5 justify-between py-1 border-b h-[33px] shrink-0">
					<h1 className="text-sm font-medium">State</h1>
					<Button
						variant="ghost"
						size="icon"
						className="h-6 w-6"
						onClick={fetchState}
						disabled={loading}
					>
						<RefreshCwIcon className={`size-3 ${loading ? "animate-spin" : ""}`} />
					</Button>
				</nav>
				<div className="flex-1 overflow-y-auto p-2">
					{error ? (
						<div className="text-red-500 text-sm p-4 text-center">
							<p className="font-medium">Error:</p>
							<p>{error}</p>
							<Button
								variant="outline"
								size="sm"
								className="mt-2"
								onClick={fetchState}
							>
								Try Again
							</Button>
						</div>
					) : state ? (
            <div className="text-sm">
              <JsonViewer data={state} />
            </div>
					) : loading ? (
						<div className="text-center p-4 text-sm text-gray-500">
							Loading state...
						</div>
					) : (
						<div className="text-center p-4 text-sm text-gray-500">
							No state available
						</div>
					)}
				</div>
			</div>
		</Layout>
	);
}
