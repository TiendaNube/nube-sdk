import { useEffect, useRef, useState } from "react";

/**
 * How long a row stays tinted. Matches the events table, where the tint is
 * dropped after 600ms and fades out over the row's 1s color transition.
 */
export const HIGHLIGHT_DURATION = 600;

/**
 * Tints something for a moment whenever `token` changes.
 *
 * The events table gets this for free by highlighting on mount: every event is
 * a new row. A storage row is not — it stands for an entry that persists and is
 * rewritten in place, so the flash has to follow the value rather than the
 * row's lifetime.
 *
 * @param token Changes exactly when the thing being watched changes.
 * @param highlightOnMount For a row that is genuinely new, as opposed to one
 * that was already there when the panel first drew the list.
 */
export function useChangeHighlight(
	token: string,
	highlightOnMount = false,
): boolean {
	// A counter rather than a boolean: a second change arriving while the
	// first is still fading has to restart the timer, and an effect keyed on a
	// boolean that is already `true` would not re-run.
	const [pulse, setPulse] = useState(highlightOnMount ? 1 : 0);
	const [isHighlighted, setIsHighlighted] = useState(highlightOnMount);
	const seenToken = useRef(token);

	useEffect(() => {
		if (seenToken.current === token) return;
		seenToken.current = token;
		setPulse((value) => value + 1);
	}, [token]);

	useEffect(() => {
		if (pulse === 0) return;

		setIsHighlighted(true);
		const timer = setTimeout(() => setIsHighlighted(false), HIGHLIGHT_DURATION);
		return () => clearTimeout(timer);
	}, [pulse]);

	return isHighlighted;
}
