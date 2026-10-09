export type ScriptStatus = "checking" | "online" | "offline";

export const getScriptStatusLabel = (status: ScriptStatus) => {
	switch (status) {
		case "checking":
			return "checking...";
		case "online":
			return "online";
		case "offline":
			return "offline";
	}
};

export const getScriptStatusColor = (status: ScriptStatus) => {
	switch (status) {
		case "checking":
			return "text-muted-foreground";
		case "online":
			return "text-emerald-400/70";
		case "offline":
			return "text-rose-400/70";
	}
};

export const getScriptStatusDotColor = (status?: ScriptStatus) => {
	switch (status) {
		case "online":
			return "text-emerald-400";
		case "offline":
			return "text-rose-400";
		default:
			return "text-muted-foreground/50";
	}
};

export const isLocalScript = (script: string) =>
	script.includes("localhost") || script.includes("127.0.0.1");
