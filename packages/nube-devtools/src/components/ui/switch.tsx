import { cn } from "@/lib/utils";

type SwitchProps = {
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
	disabled?: boolean;
	"aria-label"?: string;
	className?: string;
};

export function Switch({
	checked,
	onCheckedChange,
	disabled,
	className,
	...props
}: SwitchProps) {
	return (
		<button
			type="button"
			role="switch"
			aria-checked={checked}
			aria-label={props["aria-label"]}
			disabled={disabled}
			onClick={() => onCheckedChange(!checked)}
			className={cn(
				"inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-transparent p-0.5 transition-colors",
				"focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
				"disabled:cursor-not-allowed disabled:opacity-50",
				checked ? "bg-emerald-500/80" : "bg-input",
				className,
			)}
		>
			<span
				className={cn(
					"pointer-events-none block size-4 rounded-full bg-white shadow transition-transform",
					checked ? "translate-x-4" : "translate-x-0",
				)}
			/>
		</button>
	);
}
