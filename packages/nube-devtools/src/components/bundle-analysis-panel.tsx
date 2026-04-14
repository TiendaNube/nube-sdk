import type { AnalysisReport, AnalysisWarning } from "@/analyzer";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
	AlertCircle,
	AlertTriangle,
	CheckCircle2,
	ExternalLink,
	FileCode,
	FileWarning,
	Info,
	Package,
	RefreshCw,
	XCircle,
} from "lucide-react";

interface BundleAnalysisPanelProps {
	analysis: AnalysisReport | null;
	onRetryAnalysis?: () => void;
}

function formatBytes(bytes: number | null): string {
	if (bytes === null) return "—";
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(dateString: string): string {
	const date = new Date(dateString);
	const year = date.getUTCFullYear();
	const month = String(date.getUTCMonth() + 1).padStart(2, "0");
	const day = String(date.getUTCDate()).padStart(2, "0");
	const hours = String(date.getUTCHours()).padStart(2, "0");
	const minutes = String(date.getUTCMinutes()).padStart(2, "0");
	const seconds = String(date.getUTCSeconds()).padStart(2, "0");
	return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} UTC`;
}

function SeverityIcon({ severity }: { severity: AnalysisWarning["severity"] }) {
	switch (severity) {
		case "error":
			return <AlertCircle className="size-4 text-red-400" />;
		case "warning":
			return <AlertTriangle className="size-4 text-yellow-400" />;
		case "info":
			return <Info className="size-4 text-blue-400" />;
	}
}

function SeverityBadge({
	severity,
}: { severity: AnalysisWarning["severity"] }) {
	const variants = {
		error: "bg-red-500/20 text-red-400 border-red-500/30",
		warning: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
		info: "bg-blue-500/20 text-blue-400 border-blue-500/30",
	};

	return (
		<Badge
			className={cn("uppercase text-[10px] font-mono", variants[severity])}
		>
			{severity}
		</Badge>
	);
}

function StatusBadge({ status }: { status: AnalysisReport["status"] }) {
	const config = {
		ok: {
			icon: CheckCircle2,
			text: "OK",
			className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
		},
		parse_error: {
			icon: FileWarning,
			text: "Parse Error",
			className: "bg-red-500/20 text-red-400 border-red-500/30",
		},
		fetch_error: {
			icon: XCircle,
			text: "Fetch Error",
			className: "bg-red-500/20 text-red-400 border-red-500/30",
		},
	};

	const { icon: Icon, text, className } = config[status];

	return (
		<Badge className={cn("gap-1.5", className)}>
			<Icon className="size-3" />
			{text}
		</Badge>
	);
}

function RuleBadge({ rule }: { rule: string }) {
	return (
		<Badge className="bg-zinc-700/50 text-zinc-300 border-zinc-600 font-mono text-[10px]">
			{rule}
		</Badge>
	);
}

function WarningItem({ warning }: { warning: AnalysisWarning }) {
	return (
		<AccordionItem value={warning.id} className="border-zinc-700/50">
			<AccordionTrigger className="hover:no-underline py-3 gap-3">
				<div className="flex items-start gap-3 flex-1 min-w-0">
					<SeverityIcon severity={warning.severity} />
					<div className="flex flex-col gap-1.5 text-left min-w-0 flex-1">
						<div className="flex items-center gap-2 flex-wrap">
							<SeverityBadge severity={warning.severity} />
							<RuleBadge rule={warning.rule} />
						</div>
						<code className="text-sm text-zinc-200 font-mono break-all">
							{warning.message}
						</code>
					</div>
				</div>
			</AccordionTrigger>
			<AccordionContent className="pb-4">
				<div className="pl-7 space-y-3">
					{/* Location info */}
					<div className="bg-zinc-800/50 rounded-md p-3 border border-zinc-700/50">
						<div className="text-xs text-zinc-400 uppercase tracking-wide mb-2 font-medium">
							Location
						</div>
						<div className="space-y-1.5">
							{warning.location.generated && (
								<div className="flex items-center gap-2 text-sm">
									<span className="text-zinc-500">Generated:</span>
									<code className="text-zinc-300 font-mono text-xs">
										Line {warning.location.generated.line}, Col{" "}
										{warning.location.generated.column}
									</code>
								</div>
							)}
							{warning.location.original ? (
								<div className="flex items-center gap-2 text-sm">
									<span className="text-zinc-500">Original:</span>
									<code className="text-emerald-400 font-mono text-xs">
										{warning.location.original.source}:
										{warning.location.original.line}:
										{warning.location.original.column}
									</code>
								</div>
							) : (
								<div className="text-xs text-zinc-500 italic">
									Source map not available
								</div>
							)}
						</div>
					</div>

					{/* Hints */}
					{warning.hints?.app && (
						<div className="bg-blue-500/10 rounded-md p-3 border border-blue-500/20">
							<div className="text-xs text-blue-400 uppercase tracking-wide mb-1.5 font-medium flex items-center gap-1.5">
								<Info className="size-3" />
								Hint
							</div>
							<p className="text-sm text-zinc-300">{warning.hints.app}</p>
						</div>
					)}
				</div>
			</AccordionContent>
		</AccordionItem>
	);
}

function ErrorDisplay({
	error,
	status,
	onRetry,
}: {
	error: AnalysisReport["error"];
	status: AnalysisReport["status"];
	onRetry?: () => void;
}) {
	if (!error) return null;

	return (
		<div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
			<div className="flex items-start gap-3">
				<XCircle className="size-5 text-red-400 mt-0.5 shrink-0" />
				<div className="space-y-2 min-w-0 flex-1">
					<div className="text-sm font-medium text-red-400">
						{status === "fetch_error"
							? "Failed to fetch bundle"
							: "Failed to parse bundle"}
					</div>
					<code className="text-xs text-zinc-400 font-mono break-all block">
						{error.message}
					</code>
					{onRetry && (
						<Button
							variant="outline"
							size="sm"
							onClick={onRetry}
							className="mt-2 bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-200"
						>
							<RefreshCw className="size-3.5 mr-1.5" />
							Retry Analysis
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}

function SummaryByRule({ byRule }: { byRule: Record<string, number> }) {
	const entries = Object.entries(byRule);
	if (entries.length === 0) return null;

	return (
		<div className="flex flex-wrap gap-2">
			{entries.map(([rule, count]) => (
				<div
					key={rule}
					className="flex items-center gap-1.5 bg-zinc-800/50 rounded-md px-2.5 py-1.5 border border-zinc-700/50"
				>
					<span className="text-xs font-mono text-zinc-400">{rule}</span>
					<span className="bg-zinc-700 text-zinc-300 text-xs font-medium px-1.5 py-0.5 rounded">
						{count}
					</span>
				</div>
			))}
		</div>
	);
}

export function BundleAnalysisPanel({
	analysis,
	onRetryAnalysis,
}: BundleAnalysisPanelProps) {
	if (!analysis) {
		return (
			<div className="flex items-center justify-center h-full text-zinc-500">
				<div className="text-center space-y-2">
					<FileCode className="size-12 mx-auto opacity-50" />
					<p>Select an app to view bundle analysis</p>
				</div>
			</div>
		);
	}

	const errorCount = analysis.warnings.filter(
		(w) => w.severity === "error",
	).length;
	const warningCount = analysis.warnings.filter(
		(w) => w.severity === "warning",
	).length;
	const infoCount = analysis.warnings.filter(
		(w) => w.severity === "info",
	).length;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
					<Package className="size-5" />
					Bundle Analysis
				</h2>
				<StatusBadge status={analysis.status} />
			</div>

			{/* Error display for failed states */}
			{analysis.error && (
				<ErrorDisplay
					error={analysis.error}
					status={analysis.status}
					onRetry={onRetryAnalysis}
				/>
			)}

			{/* Bundle Info */}
			<div className="bg-zinc-800/30 rounded-lg p-4 border border-zinc-700/50">
				<div className="text-xs text-zinc-400 uppercase tracking-wide mb-3 font-medium">
					Bundle Info
				</div>
				<div className="space-y-2.5">
					<div className="flex items-start gap-2">
						<span className="text-zinc-500 text-sm shrink-0 w-24">URL</span>
						<a
							href={analysis.bundle.url ?? undefined}
							target="_blank"
							rel="noopener noreferrer"
							className="text-sm text-blue-400 hover:text-blue-300 font-mono break-all flex items-center gap-1"
						>
							{analysis.bundle.url}
							<ExternalLink className="size-3 shrink-0" />
						</a>
					</div>
					<div className="flex items-center gap-2">
						<span className="text-zinc-500 text-sm w-24">Size</span>
						<span className="text-sm text-zinc-200 font-mono">
							{formatBytes(analysis.bundle.sizeBytes)}
							{analysis.bundle.sizeChars !== null && (
								<span className="text-zinc-500 ml-2">
									({analysis.bundle.sizeChars.toLocaleString()} chars)
								</span>
							)}
						</span>
					</div>
					{"sourceMapResolved" in analysis.bundle && (
						<div className="space-y-1.5">
							<div className="flex items-center gap-2">
								<span className="text-zinc-500 text-sm w-24">Source Map</span>
								<span
									className={cn(
										"text-sm font-medium",
										analysis.bundle.sourceMapResolved
											? "text-emerald-400"
											: "text-zinc-500",
									)}
								>
									{analysis.bundle.sourceMapResolved
										? "Resolved"
										: "Not available"}
								</span>
							</div>
							{analysis.bundle.sourceMapDebug && (
								<div className="flex items-start gap-2">
									<span className="text-zinc-500 text-sm w-24 shrink-0" />
									<code className="text-xs text-zinc-500 font-mono break-all">
										{analysis.bundle.sourceMapDebug}
									</code>
								</div>
							)}
						</div>
					)}
					<div className="flex items-center gap-2">
						<span className="text-zinc-500 text-sm w-24">Analyzed at</span>
						<span className="text-sm text-zinc-400">
							{formatDate(analysis.generatedAt)}
						</span>
					</div>
				</div>
			</div>

			{/* Summary */}
			{analysis.status === "ok" && (
				<div className="bg-zinc-800/30 rounded-lg p-4 border border-zinc-700/50">
					<div className="text-xs text-zinc-400 uppercase tracking-wide mb-3 font-medium">
						Summary
					</div>

					{/* Counts */}
					<div className="flex items-center gap-4 mb-4">
						<div className="flex items-center gap-2">
							<AlertCircle className="size-4 text-red-400" />
							<span className="text-sm text-zinc-300">
								<span className="font-semibold text-red-400">{errorCount}</span>{" "}
								errors
							</span>
						</div>
						<div className="flex items-center gap-2">
							<AlertTriangle className="size-4 text-yellow-400" />
							<span className="text-sm text-zinc-300">
								<span className="font-semibold text-yellow-400">
									{warningCount}
								</span>{" "}
								warnings
							</span>
						</div>
						<div className="flex items-center gap-2">
							<Info className="size-4 text-blue-400" />
							<span className="text-sm text-zinc-300">
								<span className="font-semibold text-blue-400">{infoCount}</span>{" "}
								info
							</span>
						</div>
					</div>

					{/* By Rule */}
					<div className="text-xs text-zinc-500 mb-2">By rule:</div>
					<SummaryByRule byRule={analysis.summary.byRule} />
				</div>
			)}

			{/* Warnings List */}
			{analysis.warnings.length > 0 && (
				<div>
					<div className="text-xs text-zinc-400 uppercase tracking-wide mb-3 font-medium">
						Warnings ({analysis.summary.totalWarnings})
					</div>
					<Accordion type="multiple" className="space-y-2">
						{analysis.warnings.map((warning) => (
							<WarningItem key={warning.id} warning={warning} />
						))}
					</Accordion>
				</div>
			)}

			{/* No warnings state */}
			{analysis.status === "ok" && analysis.warnings.length === 0 && (
				<div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
					<div className="flex items-center gap-3">
						<CheckCircle2 className="size-5 text-emerald-400" />
						<div className="text-sm text-emerald-400 font-medium">
							No warnings found in this bundle
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
