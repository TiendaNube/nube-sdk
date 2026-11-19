import { Box } from "@tiendanube/nube-sdk-jsx";
import type { NubeComponentChildren } from "@tiendanube/nube-sdk-types";
import { keyframes, styled } from "@tiendanube/nube-sdk-ui";

const pulse = keyframes`
	0%, 100% { opacity: 1; transform: scale(1); }
	50% { opacity: 0.5; transform: scale(0.85); }
`;

const PulseBox = styled(Box)`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	animation: ${pulse} 1.6s ease-in-out infinite;
`;

/**
 * Pulses its children: they fade and shrink a little, then come back.
 */
export const Pulse = ({ children }: { children: NubeComponentChildren }) => (
	<PulseBox>{children}</PulseBox>
);
