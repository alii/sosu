import {defineConfig} from 'tsup';

export default defineConfig({
	entry: ['src/index.ts'],
	format: 'esm',
	dts: true,
	target: 'node18',
	sourcemap: true,
	minify: true,
});
