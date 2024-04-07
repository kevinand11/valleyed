const eslint = require('@eslint/js')
const stylistic = require('@stylistic/eslint-plugin')
const tsEslintPlugin = require('@typescript-eslint/eslint-plugin')
const tsEslintParser = require('@typescript-eslint/parser')
const promise = require('eslint-plugin-promise')
const globals = require('globals')

module.exports = [
	{
		...eslint.configs.recommended,
		files: ['**/*.js', '**/*.ts'],
		ignores: ['lib/**/*'],
	},
	{
		languageOptions: {
			globals: {
				...globals.commonjs,
				...globals['shared-node-browser'],
			},
			parser: tsEslintParser,
			parserOptions: {
				sourceType: 'module',
				ecmaVersion: 2021
			},
		},
		files: ['**/*.js', '**/*.ts'],
		ignores: ['lib/**/*'],
		plugins: { promise, ts: tsEslintPlugin, style: stylistic },
		rules: {
			'no-var': 'error',
			'indent': ['error', 'tab'],
			'no-mixed-spaces-and-tabs': ['error', 'smart-tabs'],
			'semi': ['error', 'never'],
			'quotes': ['error', 'single'],
			'prefer-const': ['error'],
			'arrow-parens': ['error', 'always'],
			'no-unused-vars': 'off',
			'ts/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
		},
	}
]
