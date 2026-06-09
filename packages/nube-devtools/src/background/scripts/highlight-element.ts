export const highlightElement = (
	id: string,
	type: "enter" | "leave",
	color: "green" | "blue",
	title: string,
) => {
	const OVERLAY_ID = "nube-devtools-highlight";

	// Always clear any previous overlay so repeated hovers never stack
	// or leave a stale highlight behind.
	const previous = document.getElementById(OVERLAY_ID);
	if (previous) {
		previous.remove();
	}

	if (type !== "enter") {
		return true;
	}

	let element: HTMLElement | undefined;
	try {
		/**
		 * I'm using querySelectorAll to get all elements with the same id
		 * because there are some cases where the element is not the first one
		 * and the first one is not the one we want to highlight
		 */
		const all = document.querySelectorAll(`#${id}`);
		element = Array.from(all).find(
			(el) => (el as HTMLElement).offsetParent !== null,
		) as HTMLElement | undefined;
	} catch {}

	if (!element) {
		return true;
	}

	// `getBoundingClientRect()` is already relative to the viewport, so pairing
	// it with `position: fixed` gives a pixel-perfect overlay with no scroll math
	// and without depending on the page's containing block (positioned/
	// transformed ancestors, body margins, etc.), which is what caused the
	// highlight to land in the wrong spot.
	const rect = element.getBoundingClientRect();

	const overlay = document.createElement("div");
	overlay.id = OVERLAY_ID;
	overlay.style.position = "fixed";
	overlay.style.top = `${rect.top}px`;
	overlay.style.left = `${rect.left}px`;
	overlay.style.width = `${rect.width}px`;
	overlay.style.height = `${rect.height}px`;
	// Keep the 1px border inside the rect so the overlay matches the element
	// exactly instead of being inflated by the border.
	overlay.style.boxSizing = "border-box";
	overlay.style.margin = "0";
	overlay.style.padding = "0";
	overlay.style.pointerEvents = "none";
	overlay.style.zIndex = "2147483647";
	overlay.style.border =
		color === "green"
			? "1px dashed rgba(124, 219, 110, 0.75)"
			: "1px dashed rgba(111, 168, 220, 0.75)";
	overlay.style.backgroundColor =
		color === "green"
			? "rgba(124, 219, 110, 0.15)"
			: "rgba(111, 168, 220, 0.15)";

	const box = document.createElement("div");
	box.id = "nube-devtools-box";
	box.style.position = "absolute";
	box.style.display = "flex";
	box.style.alignItems = "center";
	box.style.justifyContent = "center";
	box.style.top = `calc(4px + ${rect.height}px)`;
	box.style.left = "0";
	box.style.backgroundColor = "#4f4f4f";
	box.style.padding = "4px 8px";
	box.style.borderRadius = "2px";
	box.style.whiteSpace = "nowrap";
	overlay.appendChild(box);

	const span1 = document.createElement("span");
	const strong1 = document.createElement("strong");
	strong1.textContent = title;
	span1.appendChild(strong1);
	span1.append(`#${id}`);
	span1.style.color = "white";
	span1.style.fontSize = "11px";
	span1.style.fontWeight = "bold";
	span1.style.borderRadius = "8px";

	box.appendChild(span1);
	document.body.appendChild(overlay);

	return true;
};
