import {
	column,
	keyframes,
	link,
	row,
	styled,
	text,
	theme,
} from "@tiendanube/nube-sdk-ui";

// Theme tokens follow the colors and fonts of each store.

const enter = keyframes`
	from { opacity: 0; transform: translateY(12px); }
	to { opacity: 1; transform: translateY(0); }
`;

export const Card = styled(column)`
	align-items: center;
	gap: 20px;
	width: 100%;
	max-width: 560px;
	margin: 32px auto;
	padding: 40px 32px;
	box-sizing: border-box;
	border-radius: 24px;
	border: 1px solid ${theme.color.accent.opacity(20)};
	background: linear-gradient(
		160deg,
		${theme.color.accent.opacity(10)} 0%,
		${theme.color.main.background} 55%
	);
	box-shadow: 0 16px 40px ${theme.color.accent.opacity(10)};
	font-family: ${theme.typography.body.font};
	text-align: center;
	animation: ${enter} 360ms ease-out both;

	@media (max-width: 600px) {
		width: auto;
		margin: 16px;
		padding: 28px 20px;
	}
`;

export const Brand = styled(row)`
	align-items: center;
	justify-content: center;
	flex-wrap: wrap;
	gap: 12px;
`;

export const Plus = styled(text)`
	margin: 0;
	font-size: 24px;
	font-weight: 300;
	color: ${theme.color.text.low};
`;

export const Title = styled(text)`
	margin: 0;
	font-size: 32px;
	line-height: 1.1;
	font-weight: 800;
	letter-spacing: -0.02em;
	color: ${theme.color.text.high};
`;

export const Subtitle = styled(text)`
	margin: 0;
	max-width: 420px;
	font-size: ${theme.typography.base.fontSize};
	line-height: ${theme.typography.base.lineHeight};
	color: ${theme.color.text.medium};
`;

export const DocsLink = styled(link)`
	display: inline-flex;
	align-items: center;
	gap: 6px;
	font-size: ${theme.typography.sm.fontSize};
	font-weight: 600;
	color: ${theme.color.accent};
	text-decoration: none;

	&:hover {
		text-decoration: underline;
	}
`;
