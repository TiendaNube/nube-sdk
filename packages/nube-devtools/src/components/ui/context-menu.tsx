import * as ContextMenuPrimitive from "@radix-ui/react-context-menu";
import type * as React from "react";

import { cn } from "@/lib/utils";

function ContextMenu({
	...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Root>) {
	return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />;
}

function ContextMenuTrigger({
	...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Trigger>) {
	return (
		<ContextMenuPrimitive.Trigger data-slot="context-menu-trigger" {...props} />
	);
}

function ContextMenuContent({
	className,
	...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Content>) {
	return (
		<ContextMenuPrimitive.Portal>
			<ContextMenuPrimitive.Content
				data-slot="context-menu-content"
				className={cn(
					"z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md py-1 text-sm",
					className,
				)}
				{...props}
			/>
		</ContextMenuPrimitive.Portal>
	);
}

function ContextMenuItem({
	className,
	...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Item>) {
	return (
		<ContextMenuPrimitive.Item
			data-slot="context-menu-item"
			className={cn(
				"relative flex cursor-pointer select-none items-center px-3 py-1.5 text-sm outline-none whitespace-nowrap",
				"focus:bg-accent focus:text-accent-foreground",
				"data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
				className,
			)}
			{...props}
		/>
	);
}

export { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger };
