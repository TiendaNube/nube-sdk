import { useEffect, useRef, useState } from "react";

export function useEventsPanel() {
	const panelContainerRef = useRef<HTMLDivElement>(null);
	const [panelWidth, setPanelWidth] = useState<number>(0);

	useEffect(() => {
		if (panelContainerRef.current) {
			const resizeObserver = new ResizeObserver((entries) => {
				for (const entry of entries) {
					setPanelWidth(entry.contentRect.width);
				}
			});

			resizeObserver.observe(panelContainerRef.current);

			return () => {
				resizeObserver.disconnect();
			};
		}
	}, []);

	return {
		panelContainerRef,
		panelWidth,
	};
}
