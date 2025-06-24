import config from '@k11/configs/eslint/base'

export default config.map((c) => ({
	...c,
	files: ['**/*.ts'],
	ignores: ['lib/**/*'],
}))
