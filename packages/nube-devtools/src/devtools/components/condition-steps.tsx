import type { ConditionOutcome, ConditionStep } from "@/utils/conditions";
import { CheckIcon, TriangleAlertIcon, XIcon } from "lucide-react";

function Step({ step, depth }: { step: ConditionStep; depth: number }) {
	return (
		<>
			<li
				className="flex items-center gap-1.5 font-mono text-[11px]"
				style={{ paddingLeft: `${depth * 12}px` }}
			>
				{step.matches ? (
					<CheckIcon className="size-3 shrink-0 text-emerald-600 dark:text-emerald-400" />
				) : (
					<XIcon className="size-3 shrink-0 text-muted-foreground" />
				)}
				<span className={step.matches ? "" : "text-muted-foreground"}>
					{step.label}
				</span>
			</li>
			{step.children?.map((child, index) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: the operands of a condition have no identity but their position
				<Step key={index} step={child} depth={depth + 1} />
			))}
		</>
	);
}

/**
 * A condition of a `Show` or `Match.When` against the current value of its
 * signal: whether it matches and, for `and`/`or`/`not`, which operands did.
 */
export function ConditionSteps({ outcome }: { outcome: ConditionOutcome }) {
	return (
		<div className="space-y-1">
			<span className="text-[10px] uppercase tracking-wide text-muted-foreground">
				Condition
			</span>
			{outcome.valid && outcome.steps ? (
				<ul className="rounded border px-2 py-1.5 space-y-0.5">
					<Step step={outcome.steps} depth={0} />
				</ul>
			) : (
				<div className="flex gap-2 rounded border border-red-500/40 bg-red-500/10 px-2 py-1.5 text-[11px] text-red-700 dark:text-red-300">
					<TriangleAlertIcon className="size-3.5 shrink-0 mt-0.5" />
					<span>
						<code className="break-all">{outcome.text}</code> is not a condition
						this version of the DevTools can read. The platform treats a
						condition it cannot read as not matching.
					</span>
				</div>
			)}
		</div>
	);
}
