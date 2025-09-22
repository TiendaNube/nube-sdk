import type {
	NubeComponent,
	NubeSDKState,
	UISlot,
} from "@tiendanube/nube-sdk-types";
import { getNubeInstance } from "./getters";

export type UIHelper = {
	showToast: (
		message: string,
		variant?: "success" | "error" | "warning" | "info",
	) => void;
	clear: (slot: UISlot) => void;
	render: (
		slot: UISlot,
		component:
			| NubeComponent
			| NubeComponent[]
			| ((state: Readonly<NubeSDKState>) => NubeComponent | NubeComponent[]),
	) => void;
};

/**
 * View helpers for NubeSDK.
 *
 * Provides methods to show toasts, clear slots, and render components.
 */

export const ui: Readonly<UIHelper> = Object.freeze({
	// Helpers for common components
	showToast(message, variant = "info") {
		const toast = {
			type: "toastRoot" as const,
			variant,
			children: [{ type: "toastTitle" as const, children: message }],
		};
		getNubeInstance().render("corner_top_right", toast);
	},

	// Clear slot
	clear(slot) {
		getNubeInstance().clearSlot(slot);
	},

	render(slot, component) {
		getNubeInstance().render(slot, component);
	},
});
