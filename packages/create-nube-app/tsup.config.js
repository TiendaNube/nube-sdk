// tsup.config.js
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  bundle: false,
  minify: false,
  sourcemap: false,
  clean: true,
  target: 'node16',
  dts: false,
});
