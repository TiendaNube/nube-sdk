import { useDevToolsTheme } from "@/contexts/devtools-theme-context";
import ReactJsonView, { type OnCopyProps } from "@microlink/react-json-view";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

interface JsonViewerProps {
	data: object;
	className?: string;
	collapsed?: number;
	modifiedPaths?: Set<string>;
	name?: string | false;
}

export function JsonViewer({
	data,
	className,
	collapsed = 2,
	modifiedPaths,
	name,
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
			const container = containerRef.current;
			if (!container) return;

			for (const el of container.querySelectorAll(".json-modified")) {
				el.classList.remove("json-modified");
			}

			const nodesByPath = indexRenderedNodes(container);
			const elementsToHighlight = new Set<Element>();

			for (const path of modifiedPaths) {
				const target = findDeepestRenderedNode(nodesByPath, path);
				if (target) {
					elementsToHighlight.add(getHighlightElement(target));
				}
			}

			for (const el of elementsToHighlight) {
				el.classList.add("json-modified");
				// Remove highlight after animation completes
				setTimeout(() => {
					el.classList.remove("json-modified");
				}, 2000);
			}
		}, 150);

		return () => clearTimeout(timeoutId);
	}, [data, modifiedPaths]);

	const handleCopy = (copy: OnCopyProps) => {
		toast.success("Copied to clipboard");
	};

	return (
		<div ref={containerRef} className={className}>
			<ReactJsonView
				src={data}
				name={name}
				theme={theme === "dark" ? "monokai" : "rjv-default"}
				collapsed={collapsed}
				displayDataTypes={false}
				iconStyle="circle"
				enableClipboard={handleCopy}
				showComma={false}
				displayObjectSize
				style={{
					backgroundColor: "transparent",
				}}
			/>
		</div>
	);
}

// ReactJsonView renders every object/array as `.object-key-val` and every
// primitive as `.variable-row`. Arrays longer than `groupArraysAfterLength` get
// extra `.array-group` wrappers that are not part of the data path.
const NODE_SELECTOR = ".object-key-val:not(.array-group), .variable-row";

/**
 * Maps the data path of every rendered node (e.g. `cart.items.0.qty`) to its
 * element. Children of collapsed nodes are not in the DOM, so they are absent.
 */
function indexRenderedNodes(container: HTMLElement): Map<string, Element> {
	const nodesByPath = new Map<string, Element>();

	for (const node of container.querySelectorAll(NODE_SELECTOR)) {
		const keys: string[] = [];
		let current: Element | null = node;
		while (current && container.contains(current)) {
			keys.unshift(getNodeKey(current));
			current = current.parentElement?.closest(NODE_SELECTOR) ?? null;
		}
		// The outermost node is the root object, which is not part of the path
		keys.shift();
		nodesByPath.set(keys.join("."), node);
	}

	return nodesByPath;
}

/** Reads the key a node is rendered under from its header row. */
function getNodeKey(node: Element): string {
	const header = node.firstElementChild;
	if (!header) return "";

	const objectKey = header.querySelector(".object-key");
	if (objectKey) {
		return (objectKey.textContent ?? "").replace(/^"|"$/g, "");
	}

	// Array items: `<span class="array-key">0</span>` on objects, or a bare
	// `0:` on primitives
	const arrayKey = header.querySelector(".array-key") ?? header;
	return (arrayKey.textContent ?? "").replace(/:.*$/, "").trim();
}

/**
 * Returns the node for `path`, or — when it is not rendered because an
 * ancestor is collapsed — the deepest rendered ancestor.
 */
function findDeepestRenderedNode(
	nodesByPath: Map<string, Element>,
	path: string,
): Element | undefined {
	const parts = path === "" ? [] : path.split(".");
	for (let i = parts.length; i >= 0; i--) {
		const node = nodesByPath.get(parts.slice(0, i).join("."));
		if (node) return node;
	}
	return undefined;
}

/**
 * Collapsed objects and primitives are highlighted whole (they fit on one
 * line). Expanded objects only get their header, so the highlight does not
 * cover all of their children.
 */
function getHighlightElement(node: Element): Element {
	const isExpanded =
		node.classList.contains("object-key-val") &&
		Array.from(node.children).some((child) =>
			child.classList.contains("pushed-content"),
		);
	return isExpanded ? node.firstElementChild ?? node : node;
}
