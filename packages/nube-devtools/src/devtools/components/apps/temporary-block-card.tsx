import {
	Field,
	FieldContent,
	FieldDescription,
	FieldLabel,
	FieldTitle,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { BanIcon } from "lucide-react";

type TemporaryBlockCardProps = {
	blocked: boolean;
	onBlockedChange: (blocked: boolean) => void;
};

export function TemporaryBlockCard({
	blocked,
	onBlockedChange,
}: TemporaryBlockCardProps) {
	return (
		<FieldLabel htmlFor="temporary-block" className="border-none">
			<Field orientation="horizontal" className="items-center p-3">
				<div
					className={`flex size-7 shrink-0 items-center justify-center rounded-lg transition-colors ${
						blocked
							? "bg-rose-400/10 text-rose-400"
							: "bg-muted/60 text-muted-foreground"
					}`}
				>
					<BanIcon className="size-3.5" />
				</div>
				<FieldContent className="gap-0.5">
					<FieldTitle className="text-xs">Temporary block</FieldTitle>
					<FieldDescription className="text-[11px]">
						Pause this app without uninstalling it.
					</FieldDescription>
				</FieldContent>
				<Switch
					id="temporary-block"
					checked={blocked}
					onCheckedChange={onBlockedChange}
				/>
			</Field>
		</FieldLabel>
	);
}
