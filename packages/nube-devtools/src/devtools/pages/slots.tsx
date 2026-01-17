import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { SidebarTrigger } from "@/components/ui/sidebar";
import Layout from "@/devtools/components/layout";
import { usePageType } from "@/hooks/use-page-type";
import { CHECKOUT_UI_SLOT } from "@tiendanube/nube-sdk-types";
import { useState } from "react";
import { toast } from "sonner";

type DataSlot = {
	slot: string;
	visible: boolean;
	id: string;
	className: string;
};

export function Slots() {
	const pageType = usePageType();
	const [loading, setLoading] = useState(false);
	const [dataSlots, setDataSlots] = useState<DataSlot[]>([]);

	// Get all slot names from CHECKOUT_UI_SLOT
	const getAllSlotNames = (): string[] => {
		try {
			// CHECKOUT_UI_SLOT is an enum/object, get all values
			return Object.values(CHECKOUT_UI_SLOT) as string[];
		} catch {
			return [];
		}
	};

	const getAllDataSlots = () => {
		chrome.runtime.sendMessage(
			{
				action: "nube-devtools-get-all-data-slots",
				payload: {
					tabId: chrome.devtools.inspectedWindow.tabId,
				},
			},
			(response: {
				status: boolean;
				slots?: DataSlot[];
				total?: number;
				error?: string;
			}) => {
				if (response.status && response.slots) {
					setDataSlots(response.slots);
					toast.success(
						`Found ${response.total || 0} data-slot${(response.total || 0) !== 1 ? "s" : ""} on page`,
					);
				} else {
					toast.error(response.error || "Failed to get data-slots");
				}
			},
		);
	};

	const handleSetAllSlots = () => {
		if (pageType !== "checkout") {
			toast.error("This action is only available on checkout pages");
			return;
		}

		const slotNames = getAllSlotNames();
		if (slotNames.length === 0) {
			toast.error("No slots found in CHECKOUT_UI_SLOT");
			return;
		}

		setLoading(true);
		chrome.runtime.sendMessage(
			{
				action: "nube-devtools-set-all-slots",
				payload: {
					tabId: chrome.devtools.inspectedWindow.tabId,
					slotNames,
				},
			},
			(response: {
				status: boolean;
				summary?: { total: number; success: number; failed: number };
				error?: string;
			}) => {
				setLoading(false);
				if (response.status && response.summary) {
					const { total, success, failed } = response.summary;
					if (failed === 0) {
						toast.success(
							`Successfully set ${success} slot${success !== 1 ? "s" : ""}`,
						);
						// After successful execution, get all data-slots from the page
						setTimeout(() => {
							getAllDataSlots();
						}, 500);
					} else {
						toast.warning(
							`Set ${success} of ${total} slots. ${failed} failed.`,
						);
					}
				} else {
					toast.error(response.error || "Failed to set slots");
				}
			},
		);
	};

	return (
		<Layout>
			<nav className="flex items-center px-1.5 justify-between py-1 border-b h-[33px]">
				<div className="flex items-center">
					<SidebarTrigger />
					{pageType === "checkout" && (
						<>
							<Divider />
							<Button
								variant="default"
								size="sm"
								className="h-6 text-xs"
								onClick={handleSetAllSlots}
								disabled={loading}
							>
								{loading ? "Setting..." : "Set All Slots"}
							</Button>
						</>
					)}
				</div>
				{pageType && (
					<Badge
						variant="secondary"
						className={`px-2 py-0 text-[10px] ${
							pageType === "checkout"
								? "bg-green-600 text-white border-green-700 hover:bg-green-700"
								: "bg-red-600 text-white border-red-700 hover:bg-red-700"
						}`}
					>
						{pageType === "checkout" ? "Checkout" : "Storefront"}
					</Badge>
				)}
			</nav>
			<div className="flex h-full flex-col">
				{dataSlots.length === 0 ? (
					<div className="flex h-full flex-col items-center justify-center">
						<p className="text-sm text-muted-foreground">Slots page</p>
						{pageType === "checkout" && (
							<p className="text-xs text-muted-foreground mt-2">
								{getAllSlotNames().length} slot
								{getAllSlotNames().length !== 1 ? "s" : ""} available
							</p>
						)}
					</div>
				) : (
					<div className="flex-1 overflow-auto p-4">
						<div className="mb-4">
							<p className="text-sm font-medium">
								Found {dataSlots.length} data-slot
								{dataSlots.length !== 1 ? "s" : ""} on page
							</p>
						</div>
						<div className="space-y-2">
							{dataSlots.map((item, index) => (
								<div
									key={`${item.slot}-${index}`}
									className="border rounded-lg p-3 bg-card"
								>
									<div className="flex items-center gap-2 mb-2">
										<Badge variant="outline" className="font-mono text-xs">
											{item.slot}
										</Badge>
										{item.visible ? (
											<Badge
												variant="secondary"
												className="bg-green-600 text-white text-xs"
											>
												Visible
											</Badge>
										) : (
											<Badge
												variant="secondary"
												className="bg-gray-600 text-white text-xs"
											>
												Hidden
											</Badge>
										)}
									</div>
									{item.className && (
										<p className="text-xs text-muted-foreground">
											Class: <span className="font-mono">{item.className}</span>
										</p>
									)}
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</Layout>
	);
}
