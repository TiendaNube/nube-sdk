import { createRequire } from "node:module";
import gulp from "gulp";
import zip from "gulp-zip";
const require = createRequire(import.meta.url);
const isFirefox = process.env.BROWSER === "firefox";
const buildDir = isFirefox ? "build-firefox" : "build";
const manifest = require(`../${buildDir}/manifest.json`);
const suffix = isFirefox ? "-firefox" : "";

gulp
	.src(`${buildDir}/**`, { encoding: false })
	.pipe(
		zip(
			`${manifest.name.replaceAll(" ", "-")}-${manifest.version}${suffix}.zip`,
		),
	)
	.pipe(gulp.dest("package"));
