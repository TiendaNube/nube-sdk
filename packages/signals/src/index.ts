/**
 * @fileoverview NubeSDK Signals Package
 * @packageDocumentation
 *
 * Reactive state for NubeSDK apps. Signals hold values, computed signals
 * derive new ones, and effects react to changes. Passed to a component, a
 * signal keeps that spot of the page in sync with its value.
 *
 * @module @tiendanube/nube-sdk-signals
 * @version 0.1.0
 * @since 0.1.0
 */

export { batch, computed, effect, signal } from "./core";
export type {
	AnySignal,
	Computed,
	EffectCallback,
	ReadonlySignal,
	Signal,
	Subscriber,
} from "./core";
export { useSignals } from "./bridge";
