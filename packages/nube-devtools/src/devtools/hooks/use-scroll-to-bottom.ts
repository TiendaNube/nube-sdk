import { useCallback, useEffect, useRef } from "react";

interface UseScrollToBottomOptions {
	/**
	 * The delay in milliseconds before scrolling to bottom
	 * @default 0
	 */
	delay?: number;
	/**
	 * Whether to scroll to bottom when the component mounts
	 * @default true
	 */
	scrollOnMount?: boolean;
	/**
	 * The dependency array that will trigger the scroll
	 * @default []
	 */
	dependencies?: number[];
}

export function useScrollToBottom<T extends HTMLElement>({
	delay = 0,
	scrollOnMount = true,
	dependencies = [],
}: UseScrollToBottomOptions = {}) {
	const containerRef = useRef<T>(null);

	const scrollToBottom = useCallback(() => {
		if (containerRef.current) {
			requestAnimationFrame(() => {
				setTimeout(() => {
					if (containerRef.current) {
						containerRef.current.scrollTop = containerRef.current.scrollHeight;
					}
				}, delay);
			});
		}
	}, [delay]);

	useEffect(() => {
		if (scrollOnMount) {
			scrollToBottom();
		}
	}, [scrollOnMount, scrollToBottom]);

	useEffect(() => {
		scrollToBottom();
	}, [...dependencies, scrollToBottom]);

	return {
		containerRef,
		scrollToBottom,
	};
}
