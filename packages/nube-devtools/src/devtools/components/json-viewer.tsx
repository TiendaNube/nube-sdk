import { useDevToolsTheme } from "@/contexts/devtools-theme-context";
import ReactJsonView from "@microlink/react-json-view";
import { useEffect, useRef } from "react";

interface JsonViewerProps {
	data: object;
	className?: string;
	collapsed?: number;
	modifiedPaths?: Set<string>;
}

export function JsonViewer({
	data,
	className,
	collapsed = 2,
	modifiedPaths,
}: JsonViewerProps) {
	const { theme } = useDevToolsTheme();
	const containerRef = useRef<HTMLDivElement>(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (!modifiedPaths || modifiedPaths.size === 0 || !containerRef.current) {
			return;
		}

		// Wait for ReactJsonView to render
		const timeoutId = setTimeout(() => {
			if (!containerRef.current) return;

			// Remove previous highlight classes
			const highlightedElements =
				containerRef.current.querySelectorAll(".json-modified");
			for (const el of highlightedElements) {
				el.classList.remove("json-modified");
			}

			// Apply highlight to modified paths
			for (const path of modifiedPaths) {
				const pathParts = path.split(".");
				const lastKey = pathParts[pathParts.length - 1];

				// Find elements by various strategies
				// Strategy 1: Look for elements with data-key attribute (used by react-json-view)
				const keyElements = containerRef.current.querySelectorAll(
					`[data-key="${lastKey}"], [data-key-name="${lastKey}"]`,
				);

				// Strategy 2: Look for elements containing the key name in their text
				// This searches for the key name in the JSON structure
				const allElements = containerRef.current.querySelectorAll(
					".react-json-view span, .react-json-view div",
				);

				const elementsToHighlight = new Set<Element>();

				// Add parent row/container for elements found by data attributes
				for (const el of keyElements) {
					// Only highlight the parent row/container, not the key element itself
					const parent = el.closest("li, .object-container, .variable-row");
					if (parent) {
						elementsToHighlight.add(parent);
					}
				}

				// Search by text content as fallback
				for (const el of allElements) {
					const text = el.textContent?.trim();
					if (
						text === `"${lastKey}"` ||
						text === lastKey ||
						text?.startsWith(`"${lastKey}":`) ||
						text?.startsWith(`${lastKey}:`)
					) {
						// elementsToHighlight.add(el);
						// Also highlight the parent row/container
						const parent = el.closest("li, .object-container, .variable-row");
						if (parent) {
							elementsToHighlight.add(parent);
						}
					}
				}

				// Apply highlight class
				for (const el of elementsToHighlight) {
					el.classList.add("json-modified");
					// Remove highlight after animation completes
					setTimeout(() => {
						el.classList.remove("json-modified");
					}, 2000);
				}
			}
		}, 150);

		return () => clearTimeout(timeoutId);
	}, [data, modifiedPaths]);

	return (
		<div ref={containerRef} className={className}>
			<ReactJsonView
				src={data}
				theme={theme === "dark" ? "monokai" : "rjv-default"}
				collapsed={collapsed}
				displayDataTypes={false}
				iconStyle="circle"
				enableClipboard
				style={{
					backgroundColor: "transparent",
				}}
			/>
		</div>
	);
}
