import { useEffect, useState } from "react";

const SECOND = 1_000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * How often the labels are recomputed. A minute is the smallest unit they show
 * past the first minute, so anything finer only re-renders for nothing. An
 * expiration therefore flips to "expired" within a tick of actually doing so,
 * which is close enough for reading a panel.
 */
const TICK = 15_000;

/** Coarse single-unit duration — enough to size up a timestamp at a glance. */
export function formatDuration(ms: number): string {
	const elapsed = Math.max(0, ms);
	if (elapsed < MINUTE) return `${Math.floor(elapsed / SECOND)}s`;
	if (elapsed < HOUR) return `${Math.floor(elapsed / MINUTE)}m`;
	if (elapsed < DAY) return `${Math.floor(elapsed / HOUR)}h`;
	return `${Math.floor(elapsed / DAY)}d`;
}

export function formatRelativeTime(timestamp: number, now: number): string {
	const elapsed = Math.max(0, now - timestamp);
	if (elapsed < 5 * SECOND) return "just now";
	return `${formatDuration(elapsed)} ago`;
}

/**
 * Includes the date, not just the time: a TTL can sit days out and an entry
 * can be days old, and a bare clock time would be ambiguous for both.
 */
export function formatAbsoluteDateTime(timestamp: number): string {
	return new Date(timestamp).toLocaleString(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	});
}

export function isExpired(expiresAt: number, now: number): boolean {
	return expiresAt <= now;
}

/** A clock that ticks only while something on screen depends on it. */
function useNow(enabled: boolean): number {
	const [now, setNow] = useState(() => Date.now());

	useEffect(() => {
		if (!enabled) return;

		const interval = setInterval(() => setNow(Date.now()), TICK);
		return () => clearInterval(interval);
	}, [enabled]);

	return now;
}

interface RelativeTimeProps {
	/**
	 * When the change was observed, or null when it was not — a storage entry
	 * that already existed before the panel read it has no knowable write
	 * time, and `fallback` is shown instead of a made-up one.
	 */
	timestamp: number | null;
	fallback?: string;
	className?: string;
}

export function RelativeTime({
	timestamp,
	fallback = "not observed",
	className,
}: RelativeTimeProps) {
	const now = useNow(timestamp !== null);

	if (timestamp === null) {
		return (
			<span
				className={className}
				title="This entry was already in storage when DevTools read it, so its write time is unknown"
			>
				{fallback}
			</span>
		);
	}

	return (
		<span className={className} title={formatAbsoluteDateTime(timestamp)}>
			{formatRelativeTime(timestamp, now)}
		</span>
	);
}

interface ExpirationProps {
	/** Absolute deadline in epoch ms, as the envelope's `ttl` field holds it. */
	expiresAt: number;
	/** Adds the absolute date next to the relative label. */
	verbose?: boolean;
	className?: string;
}

/**
 * The remaining life of an entry, or how long ago it lapsed.
 *
 * An expired entry has not been removed from the page's storage — nothing
 * sweeps it — so it keeps appearing in this panel while the SDK already treats
 * it as missing. The label is the only thing that tells the two apart.
 */
export function Expiration({
	expiresAt,
	verbose = false,
	className,
}: ExpirationProps) {
	const now = useNow(true);
	const remaining = expiresAt - now;
	const expired = isExpired(expiresAt, now);

	const label = expired
		? `expired ${formatDuration(-remaining)} ago`
		: `in ${formatDuration(remaining)}`;

	return (
		<span
			className={className}
			title={formatAbsoluteDateTime(expiresAt)}
			data-expired={expired}
		>
			{label}
			{verbose ? ` — ${formatAbsoluteDateTime(expiresAt)}` : ""}
		</span>
	);
}
