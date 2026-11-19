import { computed, signal } from "@tiendanube/nube-sdk-signals";
import { Pulse } from "./Pulse";
import { Dot, PillButton } from "./styles";

/**
 * A button that counts its clicks. The label is a signal, so each click
 * updates only the button text on the page, without rendering the slot again.
 */
export const Clicker = () => {
	const clicks = signal(0);
	const label = computed(
		() => (clicks.value === 0 ? "Click me!" : `Clicks: ${clicks.value}`),
		[clicks],
	);

	return (
		<PillButton onClick={() => clicks.value++}>
			<Pulse>
				<Dot />
			</Pulse>
			{label}
		</PillButton>
	);
};
