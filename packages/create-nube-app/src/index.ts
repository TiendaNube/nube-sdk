#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as prompts from "@clack/prompts";
import fs from "fs-extra";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function toSlug(text: string): string {
	return text.toLowerCase().replace(/\s+/g, "-");
}

interface PkgInfo {
	name: string;
	version: string;
}

function pkgFromUserAgent(userAgent: string | undefined): PkgInfo | undefined {
	if (!userAgent) return undefined;
	const pkgSpec = userAgent.split(" ")[0];
	const pkgSpecArr = pkgSpec.split("/");
	return {
		name: pkgSpecArr[0],
		version: pkgSpecArr[1],
	};
}

function isEmpty(path: string) {
	const files = fs.readdirSync(path);
	return files.length === 0 || (files.length === 1 && files[0] === ".git");
}

async function main(): Promise<void> {
	const defaultValue = "my-nube-app";
	const pkgInfo = pkgFromUserAgent(process.env.npm_config_user_agent);
	const cancel = (message = "Operation cancelled") => prompts.cancel(message);

	const projectName = await prompts.text({
		message: "What is the project's name?",
		defaultValue,
		placeholder: defaultValue,
	});
	if (prompts.isCancel(projectName)) return cancel();

	const templateName = await prompts.select({
		message: "Select a template:",
		options: [
			{ label: "minimal", value: "minimal" },
			{ label: "minimal-ui", value: "minimal-ui" },
			{ label: "minimal-ui-jsx", value: "minimal-ui-jsx" },
		],
	});
	if (prompts.isCancel(templateName)) return cancel();

	const dest = path.resolve(process.cwd(), toSlug(projectName as string));
	const src = path.join(__dirname, `../templates/${templateName as string}`);

	if (fs.existsSync(dest) && !isEmpty(dest)) {
		cancel(`Template directory "${projectName}" is not empty.`);
		return;
	}

	await fs.copy(src, dest);

	const pkgManager = pkgInfo ? pkgInfo.name : "npm";
	let doneMessage = "";
	doneMessage += "Done. Now run:\n";
	doneMessage += `\n  cd ${projectName as string}`;
	switch (pkgManager) {
		case "yarn":
			doneMessage += "\n  yarn";
			doneMessage += "\n  yarn build";
			break;
		default:
			doneMessage += `\n  ${pkgManager} install`;
			doneMessage += `\n  ${pkgManager} run build`;
			break;
	}
	prompts.outro(doneMessage);
}

main();
