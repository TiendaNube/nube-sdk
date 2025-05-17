import { Toaster } from "@/components/ui/sonner";
import { ConsoleEventsProvider } from "@/contexts/console-events-context";
import { NavigationProvider } from "@/contexts/navigation-context";
import { NetworkEventsProvider } from "@/contexts/network-events-context";
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
						<ConsoleEventsProvider>
							<NetworkEventsProvider>
								{children}
								<Toaster />
							</NetworkEventsProvider>
						</ConsoleEventsProvider>
					</NubeSDKAppsProvider>
				</NubeSDKStorageProvider>
			</NubeSDKEventsProvider>
		</NavigationProvider>
	);
};
