import { fixImportsPlugin } from 'esbuild-fix-imports-plugin'
import { defineConfig, Options } from 'tsup'

const commonOptions: Options = {
	entry: ['src/**/*'],
	sourcemap: true,
	clean: true,
	dts: false,
	minify: false,
	splitting: false,
	bundle: false,
	platform: 'neutral',
	esbuildPlugins: [fixImportsPlugin()],
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
		...commonOptions,
		format: 'cjs',
		outDir: 'dist/cjs',
		minify: true,
		outExtension: () => ({ js: '.min.cjs' }),
		clean: false,
	},
	{
		...commonOptions,
		format: 'esm',
		outDir: 'dist/types',
		sourcemap: false,
		dts: true,
	},
])
