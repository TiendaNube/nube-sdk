/**
 * Args for `changePaymentBenefit`. `value` is the benefit label rendered
 * under the gateway (e.g. "12x sem juros").
 */
export type PaymentBenefit = {
	id: string;
	value: string;
};

/**
 * Args for `addPaymentContentText`. `value` is the plain-text content to
 * render under the gateway. Host only honors this for external gateways.
 */
export type PaymentContent = {
	id: string;
	value: string;
};

/**
 * Args for `hideInstallments`. `value` is the list of installment counts to
 * hide for the gateway (e.g. `[3, 6]` hides 3x and 6x options, keeping the
 * rest visible). Host only honors this for transparent credit/debit card
 * gateways.
 */
export type InstallmentsToHide = {
	id: string;
	value: number[];
};

/**
 * Worker-facing adapter for checkout host operations.
 *
 * Each method mirrors the host's public surface 1:1. All methods cross the
 * worker / main thread boundary via the internal command channel and return
 * Promises. Errors arrive as standard `Error` instances with messages in
 * the form `"<code>: <message>"`, where `<code>` is one of
 * `unknown_command`, `command_failed`, or `timeout`.
 */
export type CheckoutCommands = {
	/**
	 * Logs the IDs of every payment gateway currently enabled in the
	 * checkout to the host console. Does **not** return the list — the
	 * host method is fire-and-forget and intended for debugging.
	 */
	getPaymentIds(): Promise<void>;

	/**
	 * Hides one or more payment options.
	 *
	 * @param gatewayIds — Array of gateway IDs to hide.
	 */
	hidePaymentOptions(gatewayIds: string[]): Promise<void>;

	/**
	 * Changes the benefit (label rendered under the option) for a payment
	 * gateway.
	 */
	changePaymentBenefit(benefit: PaymentBenefit): Promise<void>;

	/**
	 * Adds descriptive content under a payment option. Host only honors
	 * this for external gateways.
	 */
	addPaymentContentText(content: PaymentContent): Promise<void>;

	/**
	 * Hides specific installment counts for a payment gateway, keeping the
	 * gateway itself (and other installment counts) visible. Host only
	 * honors this for transparent credit/debit card gateways.
	 */
	hideInstallments(installments: InstallmentsToHide): Promise<void>;
};
