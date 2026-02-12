import { type VariantProps, cva } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const alertVariants = cva(
	"flex gap-3 w-full rounded-lg border px-4 py-3 [&>svg]:size-4 [&>svg]:shrink-0",
	{
		variants: {
			variant: {
				default:
					"bg-background text-foreground border-border [&>svg]:text-foreground",
				destructive:
					"border-destructive/50 bg-destructive/10 text-destructive dark:border-destructive [&>svg]:text-destructive",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

function Alert({
	className,
	variant,
	...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
	return (
		<div
			data-slot="alert"
			role="alert"
			className={cn(alertVariants({ variant }), className)}
			{...props}
		/>
	);
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="alert-title"
			className={cn("font-medium leading-none tracking-tight", className)}
			{...props}
		/>
	);
}

function AlertDescription({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="alert-description"
			className={cn("text-sm [&_p]:leading-relaxed", className)}
			{...props}
		/>
	);
}

export { Alert, AlertDescription, AlertTitle, alertVariants };
