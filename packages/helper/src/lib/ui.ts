import type {
	DynamicSlot,
	NubeComponent,
	NubeSDKState,
	StaticSlot,
	UISlotArg,
} from "@tiendanube/nube-sdk-types";
import { getNubeInstance } from "./instance";
import type { QuerySlotResult } from "./slots";
import { isPromise } from "./utils";

/**
 * Visual variants supported by {@link UIHelper.showToast}.
 *
 * @since 0.1.0
 */
export type ToastVariant = "success" | "error" | "warning" | "info";

/**
 * A component, list of components, or a render function that derives them from
 * the current state.
 *
 * @since 0.1.0
 */
export type RenderableComponent =
	| NubeComponent
	| NubeComponent[]
	| ((state: Readonly<NubeSDKState>) => NubeComponent | NubeComponent[]);

export type UIHelper = {
	showToast: (message: string, variant?: ToastVariant) => void;
	clear: <const TSlot extends string>(slot: UISlotArg<TSlot>) => void;
	render: {
		<const TSlot extends string>(
			slot: UISlotArg<TSlot> | StaticSlot | DynamicSlot,
			component: RenderableComponent,
		): void;
		(slot: Promise<QuerySlotResult>, component: RenderableComponent): void;
	};
	renderAll: <const TSlot extends string>(
		slots: UISlotArg<TSlot>[],
		component: RenderableComponent,
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
	clear<const TSlot extends string>(slot: UISlotArg<TSlot>) {
		getNubeInstance().clearSlot<TSlot>(slot);
	},

	render<const TSlot extends string>(
		slot:
			| UISlotArg<TSlot>
			| StaticSlot
			| DynamicSlot
			| Promise<QuerySlotResult>,
		component: RenderableComponent,
	) {
		isPromise<QuerySlotResult>(slot)
			? slot
					.then(
						(resolved) =>
							resolved !== null &&
							getNubeInstance().render<TSlot>(resolved, component),
					)
					.catch((error) => console.error(error))
			: getNubeInstance().render<TSlot>(slot, component);
	},

	// Render the same component across multiple slots in a single call.
	renderAll<const TSlot extends string>(
		slots: UISlotArg<TSlot>[],
		component: RenderableComponent,
	) {
		const nube = getNubeInstance();
		for (const slot of slots) {
			nube.render<TSlot>(slot, component);
		}
	},
});
