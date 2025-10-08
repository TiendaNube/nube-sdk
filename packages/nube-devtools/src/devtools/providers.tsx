import { Toaster } from "@/components/ui/sonner";
import { NavigationProvider } from "@/contexts/navigation-context";
import { NubeSDKAppsProvider } from "@/contexts/nube-sdk-apps-context";
import { NubeSDKEventsProvider } from "@/contexts/nube-sdk-events-context";
import { NubeSDKStorageProvider } from "@/contexts/nube-sdk-storage-context";

interface ProvidersProps {
	children: React.ReactNode;
}

export const Providers = ({ children }: ProvidersProps) => {
	return (
		<NavigationProvider>
			<NubeSDKEventsProvider>
				<NubeSDKStorageProvider>
					<NubeSDKAppsProvider>
						{children}
						<Toaster />
					</NubeSDKAppsProvider>
				</NubeSDKStorageProvider>
			</NubeSDKEventsProvider>
		</NavigationProvider>
	);
};
