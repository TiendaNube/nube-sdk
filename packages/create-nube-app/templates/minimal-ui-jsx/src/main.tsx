import { Icon } from "@tiendanube/nube-sdk-jsx";
import { useSignals } from "@tiendanube/nube-sdk-signals";
import type { NubeSDK } from "@tiendanube/nube-sdk-types";
import { theme } from "@tiendanube/nube-sdk-ui";
import { Clicker } from "./components/Clicker";
import { Logo } from "./components/Logo";
import { Pulse } from "./components/Pulse";
import {
	Brand,
	Card,
	Demo,
	DocsLink,
	Hint,
	Plus,
	Subtitle,
	Title,
} from "./components/styles";

function Welcome() {
	return (
		<Card>
			<Brand>
				<Logo />
				<Plus>+</Plus>
				<Title heading={1}>NubeSDK</Title>
			</Brand>
			<Subtitle>
				Your app is running. Edit src/main.tsx and save to see your changes.
			</Subtitle>
			<Demo>
				<Clicker />
				<Hint>Each click updates only the button label.</Hint>
			</Demo>
			<DocsLink
				href="https://nuvemshop.dev/apps/nube-sdk/overview"
				target="_blank"
			>
				Read the NubeSDK docs
				<Pulse>
					<Icon
						name="external-link"
						size={16}
						color={`${theme.color.accent}`}
					/>
				</Pulse>
			</DocsLink>
		</Card>
	);
}

export function App(nube: NubeSDK) {
	useSignals(nube);

	nube.render("before_main_content", <Welcome />);
}
