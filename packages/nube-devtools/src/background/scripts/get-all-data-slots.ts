export const getAllDataSlots = () => {
	try {
		// Get all divs with data-slot attribute
		const divsWithDataSlot = document.querySelectorAll<HTMLDivElement>(
			'div[data-slot]',
		);

		// Extract data-slot values and create a list
		const dataSlots = Array.from(divsWithDataSlot).map((div) => ({
			slot: div.getAttribute('data-slot') || '',
			visible: div.offsetParent !== null,
			id: div.id || '',
			className: div.className || '',
		}));

		return {
			success: true,
			slots: dataSlots,
			total: dataSlots.length,
		};
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : String(error),
			slots: [],
			total: 0,
		};
	}
};
