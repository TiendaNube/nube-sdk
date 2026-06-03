import { ChevronDown, ChevronRight } from "lucide-react";
import type { FC } from "react";
import { useMemo, useState } from "react";
import { Button } from "../../components/ui/button";

type CustomButtonProps = {
	children: React.ReactNode;
	onClick: () => void;
	onMouseEnter: () => void;
	onMouseLeave: () => void;
	className?: string;
};

const CustomButton = ({
	children,
	onClick,
	onMouseEnter,
	onMouseLeave,
	className,
}: CustomButtonProps) => {
	return (
		<Button
			asChild
			size="sm"
			className={`flex items-center w-full justify-start p-0 h-[24px] rounded-none ${className}`}
			variant="ghost"
		>
			{/* Rendered as a div (not a button) because it contains the
			    ExpandableNode toggle button, and nested buttons are invalid HTML. */}
			<div
				role="button"
				tabIndex={0}
				onClick={onClick}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						onClick();
					}
				}}
				onMouseEnter={onMouseEnter}
				onMouseLeave={onMouseLeave}
			>
				{children}
			</div>
		</Button>
	);
};

export type LeafNode = {
	type: string;
	children: string;
	__internalId: string;
};

export type TreeNode = {
	type: string;
	children?: Array<TreeNode | LeafNode | string> | TreeNode | LeafNode | string;
	__internalId?: string;
};

type TreeViewProps = {
	data: Record<string, TreeNode | LeafNode>;
	onSelectNode?: (node: TreeNode | LeafNode) => void;
};

const componentNames = {
	box: "Box",
	col: "Column",
	img: "Image",
	field: "Field",
	fragment: "Fragment",
	row: "Row",
	txt: "Text",
	check: "Checkbox",
	txtarea: "Textarea",
	button: "Button",
};

const isTreeNode = (node: TreeNode | LeafNode | string): node is TreeNode => {
	return (
		typeof node === "object" &&
		node !== null &&
		"children" in node &&
		(Array.isArray(node.children) || typeof node.children === "object")
	);
};

const TreeNode: FC<{
	node: TreeNode | LeafNode | string;
	index: number;
	onSelectNode?: (node: TreeNode | LeafNode) => void;
}> = ({ node, index, onSelectNode }) => {
	const [isExpanded, setIsExpanded] = useState(true);

	const handleToggle = () => {
		setIsExpanded(!isExpanded);
	};

	const title = useMemo(() => {
		if (typeof node === "string") return node;
		return (
			componentNames[node.type as keyof typeof componentNames] || node.type
		);
	}, [node]);

	// A bare string child is text content with no id — render it as plain text.
	if (typeof node === "string") {
		return (
			<span
				style={{ paddingLeft: `${index * 12 + 16}px` }}
				className="block text-[12px] h-[24px] leading-[24px] text-light"
			>
				{node}
			</span>
		);
	}

	const handleHighlight = (type: "enter" | "leave") => {
		chrome.runtime.sendMessage({
			action: "nube-devtools-highlight-element",
			payload: {
				tabId: chrome.devtools.inspectedWindow.tabId,
				id: node.__internalId,
				title,
				type,
				color: "blue",
			},
		});
	};

	const handleOnClick = () => {
		chrome.runtime.sendMessage({
			action: "nube-devtools-scroll-to-element",
			payload: {
				tabId: chrome.devtools.inspectedWindow.tabId,
				id: node.__internalId,
			},
		});
	};

	if (!isTreeNode(node)) {
		return (
			<CustomButton
				className="hover:bg-[rgba(111,168,220,0.15)] dark:hover:bg-[rgba(111,168,220,0.15)]"
				onClick={() => {
					onSelectNode?.(node);
					handleOnClick();
				}}
				onMouseEnter={() => handleHighlight("enter")}
				onMouseLeave={() => handleHighlight("leave")}
			>
				<span
					style={{ paddingLeft: `${index * 12 + 16}px` }}
					className="text-[12px]"
				>
					{title}
				</span>
			</CustomButton>
		);
	}

	const children = Array.isArray(node.children)
		? node.children
		: node.children
			? [node.children]
			: [];

	return (
		<>
			<CustomButton
				onClick={() => {
					onSelectNode?.(node);
					handleOnClick();
				}}
				onMouseEnter={() => handleHighlight("enter")}
				onMouseLeave={() => handleHighlight("leave")}
				className="hover:bg-[rgba(111,168,220,0.15)] dark:hover:bg-[rgba(111,168,220,0.15)]"
			>
				<div
					style={{ paddingLeft: `${index * 12}px` }}
					className="flex items-center"
				>
					<ExpandableNode
						isExpanded={isExpanded}
						onClick={() => {
							handleToggle();
						}}
					>
						<span className="text-[12px] text-light">
							{componentNames[node.type as keyof typeof componentNames] ||
								node.type}
						</span>
					</ExpandableNode>
				</div>
			</CustomButton>
			{isExpanded && children.length > 0 && (
				<div>
					{children.map((child, childIndex) => (
						<TreeNode
							key={
								typeof child === "string"
									? `text-${childIndex}`
									: child.__internalId ?? `node-${childIndex}`
							}
							node={child}
							index={index + 1}
							onSelectNode={onSelectNode}
						/>
					))}
				</div>
			)}
		</>
	);
};

const ExpandableNode = ({
	children,
	onClick,
	isExpanded,
}: {
	children: React.ReactNode;
	onClick: () => void;
	isExpanded?: boolean;
}) => {
	return (
		<div className="flex items-center">
			<button
				type="button"
				onClick={onClick}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						onClick();
					}
				}}
				className="px-1 cursor-pointer"
			>
				{isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
			</button>
			{children}
		</div>
	);
};

export const TreeView: FC<TreeViewProps> = ({ data, onSelectNode }) => {
	const [isExpanded, setIsExpanded] = useState<Record<string, boolean>>({});

	const handleToggle = (slot: string) => {
		setIsExpanded((prev) => ({
			...prev,
			[slot]: !prev[slot],
		}));
	};

	const handleHighlight = (slot: string, type: "enter" | "leave") => {
		chrome.runtime.sendMessage({
			action: "nube-devtools-highlight-element",
			payload: {
				tabId: chrome.devtools.inspectedWindow.tabId,
				id: `nube-sdk-slot-${slot}`,
				title: slot,
				type,
				color: "green",
			},
		});
	};

	const handleOnClick = (slot: string) => {
		chrome.runtime.sendMessage({
			action: "nube-devtools-scroll-to-element",
			payload: {
				tabId: chrome.devtools.inspectedWindow.tabId,
				id: `nube-sdk-slot-${slot}`,
			},
		});
	};

	return (
		<>
			{Object.entries(data).map(([key, value]) => (
				<div key={key}>
					<CustomButton
						className="hover:bg-[rgba(124,219,110,0.15)] dark:hover:bg-[rgba(124,219,110,0.15)]"
						onMouseEnter={() => handleHighlight(key, "enter")}
						onMouseLeave={() => handleHighlight(key, "leave")}
						onClick={() => handleOnClick(key)}
					>
						<ExpandableNode
							onClick={() => handleToggle(key)}
							isExpanded={isExpanded[key]}
						>
							<span className="text-[13px] font-bold">{key}</span>
						</ExpandableNode>
					</CustomButton>
					{isExpanded[key] && (
						<TreeNode node={value} index={1} onSelectNode={onSelectNode} />
					)}
				</div>
			))}
		</>
	);
};
