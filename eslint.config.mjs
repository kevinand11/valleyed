import config from '@k11/eslint-config/base'

export default config.map((c) => ({
	...c,
	files: ['**/*.ts'],
	ignores: ['lib/**/*'],
}))