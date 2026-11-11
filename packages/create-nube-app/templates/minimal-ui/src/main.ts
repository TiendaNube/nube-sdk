import type { NubeSDK } from "@tiendanube/nube-sdk-types";
import { icon, theme } from "@tiendanube/nube-sdk-ui";
import { Logo } from "./components/Logo";
import { Pulse } from "./components/Pulse";
import {
	Brand,
	Card,
	DocsLink,
	Plus,
	Subtitle,
	Title,
} from "./components/styles";

function Welcome() {
	return Card({
		children: [
			Brand({
				children: [
					Logo(),
					Plus({ children: "+" }),
					Title({ heading: 1, children: "NubeSDK" }),
				],
			}),
			Subtitle({
				children:
					"Your app is running. Edit src/main.ts and save to see your changes.",
			}),
			DocsLink({
				href: "https://nuvemshop.dev/apps/nube-sdk/overview",
				target: "_blank",
				children: [
					"Read the NubeSDK docs",
					Pulse(
						icon({
							name: "external-link",
							size: 16,
							color: `${theme.color.accent}`,
						}),
					),
				],
			}),
		],
	});
}

export function App(nube: NubeSDK) {
	nube.render("before_main_content", Welcome());
}
