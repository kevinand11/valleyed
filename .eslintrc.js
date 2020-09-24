module.exports = {
	root: true,
	env: {
		node: true,
	},
	extends: ['eslint:recommended'],
	plugins: [
		'promise',
		'jest',
		'@typescript-eslint'
	],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2020
	},
	rules: {
		'no-var': 'error',
		'@typescript-eslint/no-unused-vars': 'error',
		'indent': ['error', 'tab'],
		'no-mixed-spaces-and-tabs': ['error', 'smart-tabs'],
		'semi': ['error', 'never'],
		'quotes': ['error', 'single'],
		'prefer-const': ['error'],
		'arrow-parens': ['error', 'always'],
	},
	overrides: [
		{
			files: ['tests/**/*.[jt]s?(x)', 'tests/**/*.spec.[jt]s?(x)'],
			env: {
				jest: true,
			},
		},
	],
}
