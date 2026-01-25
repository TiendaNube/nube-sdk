import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export const Unavailable = () => {
	return (
		<main className="min-h-screen p-8">
			<div className="max-w-2xl mx-auto">
				<div className="flex items-center gap-2 mb-4">
					<img src="/logo/logo-32.png" alt="Nube Logo" className="w-6 h-6" />
					<h3 className="text-2xl font-bold">NubeSDK</h3>
				</div>
				<Card>
					<CardHeader>
						<CardTitle className="text-red-400">Unavailable</CardTitle>
						<CardDescription>
							The "NubeSDK" is not available here—it's exclusive to{" "}
							<a
								href="https://www.nuvemshop.com.br"
								target="_blank"
								rel="noopener noreferrer"
								className="font-bold"
							>
								Nuvemshop
							</a>{" "}
							stores.
						</CardDescription>
					</CardHeader>
				</Card>
				<p className="text-gray-300 text-center mt-4">
					Check out our{" "}
					<a
						href="https://github.com/TiendaNube/nube-sdk"
						target="_blank"
						rel="noopener noreferrer"
						className="text-gray-300 hover:text-gray-400 font-bold"
					>
						GitHub repository
					</a>{" "}
					to learn more about the NubeSDK.
				</p>
			</div>
		</main>
	);
};
