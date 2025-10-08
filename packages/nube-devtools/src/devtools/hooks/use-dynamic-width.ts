import { useEffect, useRef, useState } from "react";

/**
 * Hook that tracks the width of a container element dynamically
 * Uses ResizeObserver and window resize events for accurate width tracking
 *
 * @returns Object containing:
 *   - width: Current width of the container in pixels
 *   - containerRef: Ref to attach to the container element
 */
export const useDynamicWidth = () => {
	const [width, setWidth] = useState<number>(0);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const updateWidth = () => {
			if (containerRef.current) {
				const rect = containerRef.current.getBoundingClientRect();
				setWidth(rect.width);
			}
		};

		updateWidth();

		const resizeObserver = new ResizeObserver(updateWidth);
		if (containerRef.current) {
			resizeObserver.observe(containerRef.current);
		}

		window.addEventListener("resize", updateWidth);

		return () => {
			resizeObserver.disconnect();
			window.removeEventListener("resize", updateWidth);
		};
	}, []);

	return { width, containerRef };
};
