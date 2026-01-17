export const setAllSlots = (slotNames: string[]) => {
	if (!window.nubeSDK) {
		return { success: false, error: "nubeSDK not available" };
	}

	if (!slotNames || slotNames.length === 0) {
		return { success: false, error: "No slots provided" };
	}

	try {
		// Build all slots object at once
		const slots = slotNames.reduce<Record<string, { type: string; children: string; __internalId: string }>>(
			(acc, slotName) => {
				acc[slotName] = {
					type: "box",
					children: slotName,
					__internalId: 'box-17579-xbnsfl'
				};
				return acc;
			},
			{},
		);

		// Execute script with all slots at once
		window.nubeSDK.send("*", "ui:slot:set", () => ({
			ui: {
				slots,
			},
		}));

		return {
			success: true,
			summary: {
				total: slotNames.length,
				success: slotNames.length,
				failed: 0,
			},
		};
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : String(error),
		};
	}
};
