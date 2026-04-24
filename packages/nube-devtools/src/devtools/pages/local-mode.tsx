import { LocalModeContent } from "@/components/local-mode-content";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Layout from "@/devtools/components/layout";

export function LocalModePage() {
	return (
		<Layout>
			<div className="flex h-full flex-col">
				<nav className="flex items-center px-1.5 justify-between py-1 border-b h-[33px] shrink-0">
					<SidebarTrigger />
				</nav>
				<div className="flex-1 overflow-y-auto p-4 flex justify-center">
					<LocalModeContent />
				</div>
			</div>
		</Layout>
	);
}
