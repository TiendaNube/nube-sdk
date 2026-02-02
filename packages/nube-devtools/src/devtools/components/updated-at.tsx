function formatDateTime(timestamp: number): string {
	const date = new Date(timestamp);
	return date.toLocaleString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: true,
	});
}

interface UpdatedAtProps {
	timestamp: number;
}

export function UpdatedAt({ timestamp }: UpdatedAtProps) {
	if (timestamp <= 0) {
		return null;
	}

	return (
		<span className="text-xs">Updated at {formatDateTime(timestamp)}</span>
	);
}
