import type { NubeSDK } from "@tiendanube/nube-sdk-types";
import { styled } from "@tiendanube/nube-sdk-ui";
import { Column, Text } from "@tiendanube/nube-sdk-jsx";
import { Logo } from "./components/Logo";

const StyledColumn = styled(Column)`
	display: flex;
	align-items: center;
	justify-content: center;
	padding-top: 20px;
`;

const StyledText = styled(Text)`
	font-size: 24px;
	font-weight: 600;
	color: #0050c3;
	margin: 0;
	padding: 0;
`;

export function App(nube: NubeSDK) {
	nube.render(
		"before_main_content",
		<StyledColumn>
			<Logo />
			<Text color="#626262">+</Text>
			<StyledText heading={1}>NubeSDK</StyledText>
			<Text color="#626262">
				https://dev.nuvemshop.com.br/docs/applications/nube-sdk/overview
			</Text>
		</StyledColumn>,
	);
}
