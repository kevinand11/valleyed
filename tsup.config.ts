import { defineConfig, Options } from 'tsup'

const commonOptions: Options = {
	entry: ['src/index.ts'],
	sourcemap: true,
	clean: true,
	dts: false,
	minify: false,
	splitting: false,
	esbuildOptions(options) {
		options.platform = 'node'
	},
}

export default defineConfig([
	{
		...commonOptions,
		format: 'esm',
		outDir: 'dist/esm',
		outExtension: () => ({ js: '.mjs' }),
	},
	{
		...commonOptions,
		format: 'esm',
		outDir: 'dist/esm',
		minify: true,
		outExtension: () => ({ js: '.min.mjs' }),
		clean: false,
	},
	{
		...commonOptions,
		format: 'cjs',
		outDir: 'dist/cjs',
		outExtension: () => ({ js: '.cjs' }),
	},
	{
		format: 'cjs',
		outDir: 'dist/cjs',
		minify: true,
		outExtension: () => ({ js: '.min.cjs' }),
		clean: false,
	},
	{
		entry: ['src/index.ts'],
		dts: true,
		format: 'esm',
		outDir: 'dist/types',
		clean: false,
	},
])
