import type { NubeSDK } from "@tiendanube/nube-sdk-types";
import { column, text } from "@tiendanube/nube-sdk-ui";
import { Logo } from "./components/Logo";

export function App(nube: NubeSDK) {
	nube.render(
		"before_main_content",
		column({
			style: {
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				paddingTop: "20px",
			},
			children: [
				Logo(),
				text({
					color: "#626262",
					children: "+",
				}),
				text({
					heading: 1,
					style: {
						fontSize: "24px",
						fontWeight: 600,
						color: "#0050c3",
						margin: "0",
						padding: "0",
					},
					children: "NubeSDK",
				}),
				text({
					color: "#626262",
					children:
						"https://dev.nuvemshop.com.br/docs/applications/nube-sdk/overview",
				}),
			],
		}),
	);
}
