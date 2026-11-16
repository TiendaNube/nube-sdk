import { useOptionalNubeSDKAppsMetadata } from "@/contexts/nube-sdk-apps-metadata-context";

type AppLabelProps = {
	appId: string;
	className?: string;
	/** Text before the id when the store did not describe the app, e.g. "App ". */
	idPrefix?: string;
	/** Render nothing, rather than the id, when the store did not describe the app. */
	hideIfUnknown?: boolean;
};

/**
 * An app as the panel names it: `{name} by {partner}` when the store
 * described it, its id otherwise. The id stays reachable as the tooltip.
 *
 * Works outside the metadata provider too (the popup), showing the id.
 */
export function AppLabel({
	appId,
	className,
	idPrefix = "",
	hideIfUnknown = false,
}: AppLabelProps) {
	const label = useOptionalNubeSDKAppsMetadata()?.getAppLabel(appId);

	if (!label) {
		if (hideIfUnknown) return null;
		return (
			<span className={className}>
				{idPrefix}
				{appId}
			</span>
		);
	}

	return (
		<span className={className} title={`App ${appId}`}>
			{label}
		</span>
	);
}
