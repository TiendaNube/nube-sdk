import { Copy } from "lucide-react";
import { useCallback } from "react";
import { toast } from "sonner";

export function CopyableValue({
	value,
	fontSize = "text-xs",
}: { value: string; fontSize?: string }) {
	const handleCopy = useCallback(() => {
		navigator.clipboard.writeText(value).then(() => {
			toast.success("Copied to clipboard");
		});
	}, [value]);

	return (
		<button
			type="button"
			onClick={handleCopy}
			className="group/copy flex w-full items-center gap-2 rounded-md border border-transparent px-2.5 py-1.5 text-left text-sm transition-colors hover:border-border hover:bg-muted/50"
		>
			<span className={`min-w-0 flex-1 break-all font-mono ${fontSize}`}>
				{value}
			</span>
			<span className="shrink-0 opacity-0 transition-opacity group-hover/copy:opacity-100 group-focus-within/copy:opacity-100">
				<Copy className="h-3.5 w-3.5 text-muted-foreground" />
			</span>
		</button>
	);
}
