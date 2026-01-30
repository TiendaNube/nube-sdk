#!/usr/bin/env node
import { exec } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import * as prompts from "@clack/prompts";
import fs from "fs-extra";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function formatProjectName(text: string): string {
	return text.trim().toLowerCase().replace(/\s+/g, "-");
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

function handleInstallError(projectName: string, pkgManager: string): void {
	let message = "Try run:\n";
	message += `\n  cd ${projectName}`;
	switch (pkgManager) {
		case "yarn":
			message += "\n  yarn";
			message += "\n  yarn build";
			break;
		default:
			message += `\n  ${pkgManager} install`;
			break;
	}
	prompts.outro(message);
}

async function installDependencies(
	pkgManager: string,
	dest: string,
	projectName: string,
): Promise<boolean> {
	const spinner = prompts.spinner();
	spinner.start(`Installing dependencies using ${pkgManager}...`);
	const execAsync = promisify(exec);
	try {
		await execAsync(`${pkgManager} install`, {
			cwd: dest,
		});
		spinner.stop("📦 Dependencies installed!");
		return true;
	} catch (error) {
		spinner.stop("Dependencies failed to install.");
		handleInstallError(projectName, pkgManager);
		return false;
	}
}

async function initGit(dest: string): Promise<boolean> {
	const execAsync = promisify(exec);

	try {
		await execAsync("git --version");
	} catch (error) {
		return true;
	}

	const spinner = prompts.spinner();
	spinner.start("Initializing git...");
	try {
		await execAsync("git init", {
			cwd: dest,
		});
		spinner.stop("🌱 Git initialized!");
		return true;
	} catch (error) {
		spinner.stop("Git failed to initialize.");
		return false;
	}
}

async function copyTemplateFiles(src: string, dest: string): Promise<void> {
	await fs.copy(src, dest);

	// Rename gitignore to .gitignore (NPM ignores .gitignore files during publish)
	const gitignorePath = path.join(dest, "gitignore");
	const dotGitignorePath = path.join(dest, ".gitignore");

	if (await fs.pathExists(gitignorePath)) {
		await fs.move(gitignorePath, dotGitignorePath);
	}
}

function cancel(message = "Operation cancelled") {
	return prompts.cancel(message);
}

function validateProjectName(value: string): string | undefined {
	if (/[^a-zA-Z0-9\-_]/.test(value)) return "No special characters allowed!";
	return undefined;
}

async function main(): Promise<void> {
	const defaultValue = "my-nube-app";
	const pkgInfo = pkgFromUserAgent(process.env.npm_config_user_agent);
	const pkgManager = pkgInfo ? pkgInfo.name : "npm";

	const promptProjectName = await prompts.text({
		message: "What is the project's name?",
		defaultValue,
		placeholder: defaultValue,
		validate: validateProjectName,
	});
	const projectName = formatProjectName(
		typeof promptProjectName === "string" ? promptProjectName : "",
	);
	if (prompts.isCancel(promptProjectName)) return cancel();

	const promptTemplateName = await prompts.select({
		message: "Select a template:",
		options: [
			{ label: "Minimal", value: "minimal" },
			{ label: "Minimal with UI", value: "minimal-ui" },
			{ label: "Minimal with UI in JSX", value: "minimal-ui-jsx" },
		],
	});
	const templateName = promptTemplateName as string;
	if (prompts.isCancel(promptTemplateName)) return cancel();

	const dest = path.resolve(process.cwd(), projectName);
	const src = path.join(__dirname, `../templates/${templateName}`);

	if (fs.existsSync(dest) && !isEmpty(dest)) {
		cancel(`Template directory "${projectName}" is not empty.`);
		return;
	}

	try {
		await copyTemplateFiles(src, dest);
	} catch (error) {
		cancel("Failed to copy template files.");
		return;
	}

	const shouldInitGit = await prompts.confirm({
		message: "Initialize git repository?",
		initialValue: true,
	});
	if (prompts.isCancel(shouldInitGit)) return cancel();

	if (shouldInitGit) {
		const gitSuccess = await initGit(dest);
		if (!gitSuccess) return;
	}

	const success = await installDependencies(pkgManager, dest, projectName);
	if (!success) return;

	let message = "🚀 Done. Now run:\n";
	message += `\n  cd ${projectName}`;
	message += `\n  ${pkgManager} run dev`;
	prompts.outro(message);
}

main();
