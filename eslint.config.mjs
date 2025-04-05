import eslint from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import tsEslintPlugin from '@typescript-eslint/eslint-plugin'
import tsEslintParser from '@typescript-eslint/parser'
import promise from 'eslint-plugin-promise'
import globals from 'globals'

export default [
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
