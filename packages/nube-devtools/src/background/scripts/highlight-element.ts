export const highlightElement = (
	id: string,
	type: "enter" | "leave",
	color: "green" | "blue",
	title: string,
) => {
	let element = null;
	try {
		/**
		 * I'm using querySelectorAll to get all elements with the same id
		 * because there are some cases where the element is not the first one
		 * and the first one is not the one we want to highlight
		 */
		const all = document.querySelectorAll(`#${id}`) || [];
		element = Array.from(all).find(
			(el) => (el as HTMLElement).offsetParent !== null,
		);
	} catch {}

	if (element) {
		const overlay = document.createElement("div");
		overlay.id = "nube-devtools-highlight";
		if (type === "enter") {
			const rect = element.getBoundingClientRect();
			const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
			const scrollTop = window.scrollY || document.documentElement.scrollTop;

			const absoluteLeft = rect.left + scrollLeft;
			const absoluteTop = rect.top + scrollTop;

			overlay.style.position = "absolute";
			overlay.style.top = `${absoluteTop}px`;
			overlay.style.left = `${absoluteLeft}px`;
			overlay.style.width = `${rect.width}px`;
			overlay.style.height = `${rect.height}px`;
			overlay.style.border =
				color === "green"
					? "1px dashed rgba(124, 219, 110, 0.75)"
					: "1px dashed rgba(111, 168, 220, 0.75)";
			overlay.style.backgroundColor =
				color === "green"
					? "rgba(124, 219, 110, 0.15)"
					: "rgba(111, 168, 220, 0.15)";
			overlay.style.pointerEvents = "none";

			const box = document.createElement("div");
			box.id = "nube-devtools-box";
			box.style.position = "absolute";
			box.style.display = "flex";
			box.style.alignItems = "center";
			box.style.justifyContent = "center";
			box.style.top = `calc(4px + ${rect.height}px)`;
			box.style.backgroundColor = "#4f4f4f";
			box.style.padding = "4px 8px";
			box.style.borderRadius = "2px";
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
		} else {
			const overlay = document.getElementById("nube-devtools-highlight");
			if (overlay) {
				document.body.removeChild(overlay);
			}
		}
	}
	return true;
};
