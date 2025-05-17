import { useNetworkEventsContext } from "@/contexts/network-events-context";
import Layout from "@/devtools/components/layout";

export function Network() {
	const { events } = useNetworkEventsContext();

	return (
		<Layout>
			<div>
				{events.map((event) => (
					<div key={event.id}>{}
						<div>{event.data.url}</div>
					</div>
				))}
			</div>
		</Layout>
	);
}
