/**
 * @fileoverview Event subscription helpers for NubeSDK
 *
 * Thin, ergonomic wrappers around `nube.on` that return an unsubscribe
 * function, plus sugar for the very common "show a toast when an event fires"
 * pattern seen across apps.
 */

import type {
	EventListenerMap,
	NubeSDKListenableEvent,
	NubeSDKState,
} from "@tiendanube/nube-sdk-types";
import { getNubeInstance } from "./instance";
import { type ToastVariant, ui } from "./ui";

/**
 * Subscribes a listener to a NubeSDK event and returns an unsubscribe function.
 *
 * Equivalent to calling `nube.on(event, listener)`, but the returned function
 * detaches the listener via `nube.off`, so you don't need to hold a reference
 * to both the instance and the listener to clean it up.
 *
 * @param event - The event to listen for
 * @param listener - The listener to register
 * @returns An unsubscribe function
 *
 * @example
 * ```typescript
 * const unsubscribe = onEvent("cart:update", (state) => {
 *   console.log("Cart now has", state.cart.items.length, "items");
 * });
 *
 * // Later:
 * unsubscribe();
 * ```
 *
 * @since 0.1.0
 */
export function onEvent<T extends NubeSDKListenableEvent>(
	event: T,
	listener: EventListenerMap[T],
): () => void {
	const nube = getNubeInstance();
	// Guard against duplicate registration (e.g. after SPA navigation):
	// remove first so the same listener is never attached more than once.
	nube.off(event, listener);
	nube.on(event, listener);
	return () => nube.off(event, listener);
}

/**
 * Shows a toast whenever the given event fires.
 *
 * Replaces the repetitive `nube.on("...:success", () => ui.showToast(...))`
 * pattern. The message can be a static string or a function deriving it from
 * the current state.
 *
 * @param event - The event to listen for
 * @param message - The toast message, or a function returning it from state
 * @param variant - Optional toast variant (defaults to the {@link ui.showToast} default)
 * @returns An unsubscribe function
 *
 * @example
 * ```typescript
 * toastOn("cart:add:success", "Product added to cart", "success");
 *
 * toastOn(
 *   "cart:update",
 *   (state) => `Cart updated: ${state.cart.items.length} items`,
 * );
 * ```
 *
 * @since 0.1.0
 */
export function toastOn<T extends NubeSDKListenableEvent>(
	event: T,
	message: string | ((state: Readonly<NubeSDKState>) => string),
	variant?: ToastVariant,
): () => void {
	const listener = ((state: Readonly<NubeSDKState>) => {
		const text = typeof message === "function" ? message(state) : message;
		ui.showToast(text, variant);
	}) as EventListenerMap[T];

	return onEvent(event, listener);
}
