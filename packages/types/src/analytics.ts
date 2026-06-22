/**
 * Free-form event payload forwarded as-is to the host's analytics provider
 * (e.g. the `params` slot of `gtag('event', name, params)`). Standard GA4
 * recommended fields (`currency`, `value`, `items`, …) live here.
 */
export type AnalyticsEventData = Record<string, unknown>;

/**
 * Extra options that shape how the host dispatches the event without being
 * part of the event payload itself.
 */
export type AnalyticsEventOptions = {
	/**
	 * Restricts the event to a single provider/measurement id. When present,
	 * the host forwards it as `send_to` so the event reaches only that
	 * destination; otherwise the host's default fan-out (one event per
	 * configured measurement id) applies.
	 *
	 * Useful when a store has more than one analytics account configured
	 * (e.g. multiple GA4 properties, or GA4 + Google Ads side by side) and
	 * the app wants to target a specific one.
	 */
	target?: string;
};

/**
 * Worker-facing adapter for analytics host operations.
 *
 * Crosses the worker / main thread boundary via the internal command channel
 * and returns Promises. The adapter is provider-agnostic on purpose — the
 * host decides which underlying provider(s) receive the event .
 * Errors arrive as standard `Error` instances with messages in the form
 * `"<code>: <message>"`, where `<code>` is one of `unknown_command`,
 * `command_failed`, or `timeout`.
 */
export type AnalyticsCommands = {
	/**
	 * Sends an analytics event.
	 *
	 * @param name — The event name (e.g. `'purchase'`, `'add_to_cart'`, or a
	 *   custom name for app-specific events).
	 * @param data — The event payload, forwarded as-is to the host provider.
	 * @param options — Optional dispatch options. Pass `{ target }` to limit
	 *   the event to a single measurement id; omit for the host's default
	 *   fan-out across every configured provider.
	 */
	event(
		name: string,
		data: AnalyticsEventData,
		options?: AnalyticsEventOptions,
	): Promise<void>;
};
