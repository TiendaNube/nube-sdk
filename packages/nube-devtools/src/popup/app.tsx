import { Toaster } from "@/components/ui/sonner";
import { Unavailable } from "@/devtools/pages/unavailable";
import { useNubeStatus } from "@/hooks/use-nube-status";
import { Popup } from "./popup";

const AppContent = () => {
	const nubeStatus = useNubeStatus();

	if (!nubeStatus) {
		return <Unavailable />;
	}

	return <Popup />;
};

export function App() {
	return (
		<>
			<AppContent />
			<Toaster />
		</>
	);
}
