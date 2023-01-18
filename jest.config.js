const { pathsToModuleNameMapper } = require('ts-jest')
const { compilerOptions } = require('./tsconfig')
module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths),
	modulePaths: [
		'./'
	],
	roots: [
		'./'
	],
	testMatch: [
		'**/tests/**/*.[jt]s?(x)',
		'**/tests/**/?(*.)+(spec|test).[jt]s?(x)'
	],
	transform: {
		'^.+\\.ts(x)?$': 'ts-jest'
	}
}