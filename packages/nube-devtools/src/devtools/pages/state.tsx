import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { NubeSDKEventData } from "@/contexts/nube-sdk-events-context";
import { JsonViewer } from "@/devtools/components/json-viewer";
import { UpdatedAt } from "@/devtools/components/updated-at";
import { getModifiedPaths } from "@/utils/json-diff";
import type { NubeSDKState } from "@tiendanube/nube-sdk-types";
import { RefreshCwIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import Layout from "../components/layout";

const GET_STATE_EXPRESSION = "window.nubeSDK?.getState?.()";

export function State() {
	const [updatedAt, setUpdatedAt] = useState<number>(0);
	const [state, setState] = useState<NubeSDKState | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [modifiedPaths, setModifiedPaths] = useState<Set<string>>(new Set());
	const previousStateRef = useRef<NubeSDKState | null>(null);

	useEffect(() => {
		const listener = (port: chrome.runtime.Port) => {
			if (port.name === "nube-devtools-events") {
				port.onMessage.addListener((message) => {
					fetchState();
					setUpdatedAt(Date.now());
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
			GET_STATE_EXPRESSION,
			(result, isException) => {
				setLoading(false);

				if (
					isException ||
					!result ||
					(typeof result === "object" && Object.keys(result).length === 0)
				) {
					setError(
						isException?.value ||
							"nubeSDK.getState() not found or returned null",
					);
					setState(null);
				} else {
					const newState = result as NubeSDKState;

					// Calculate modified paths if we have a previous state
					if (previousStateRef.current) {
						const paths = getModifiedPaths(previousStateRef.current, newState);
						setModifiedPaths(paths);
					} else {
						setModifiedPaths(new Set());
					}

					previousStateRef.current = newState;
					setState(newState);
					setUpdatedAt(Date.now());
				}
			},
		);
	}, []);

	useEffect(() => {
		fetchState();
	}, [fetchState]);

	return (
		<Layout>
			<div className="flex h-full flex-col">
				<nav className="flex items-center justify-between px-1.5 py-1 border-b h-[33px] shrink-0">
					<div className="flex items-center">
						<SidebarTrigger />
						<Divider />
						<div className="flex items-center gap-2">
							<Button
								variant="ghost"
								size="icon"
								className="h-6 w-6"
								onClick={fetchState}
								disabled={loading}
							>
								<RefreshCwIcon
									className={`size-3 ${loading ? "animate-spin" : ""}`}
								/>
							</Button>
						</div>
					</div>
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
							<JsonViewer
								data={state}
								collapsed={1}
								modifiedPaths={modifiedPaths}
							/>
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
