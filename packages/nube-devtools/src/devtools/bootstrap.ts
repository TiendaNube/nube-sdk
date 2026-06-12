const isDev = process.env.NODE_ENV === "development";

chrome.devtools.panels.create(
	`NubeSDK${isDev ? " - DEV" : ""}`,
	"",
	"panel.html",
);
