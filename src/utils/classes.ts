import util from 'util'

util.inspect.defaultOptions.depth = Number.MAX_SAFE_INTEGER
util.inspect.defaultOptions.getters = true
util.inspect.defaultOptions.numericSeparator = true

const customInspectSymbol = Symbol.for('nodejs.util.inspect.custom')

type Accessor<Keys extends Record<string, any>> = {
	get: <Key extends keyof Keys>(key: Key, keysObj: Keys) => Keys[Key],
	set: <Key extends keyof Keys>(key: Key, value: Keys[Key], keysObj: Keys) => void,
}

class __Wrapped<Keys extends Record<string, any>> {
	constructor (keys: Keys, access: Accessor<Keys> = {
		get: (key, keys) => keys[key],
		set: (key, value, keys) => {
			keys[key] = value
		}
	}) {
		Object.keys(keys).forEach((key) => {
			Object.defineProperty(this, key, {
				get: () => access.get(key as keyof Keys, keys),
				set: (value: any) => {
					access.set(key as keyof Keys, value, keys)
				},
				enumerable: true,
				configurable: true,
			})
		})
	}

	[customInspectSymbol] (_, options, inspect) {
		options.getters = true
		options.numericSeparator = true
		options.depth = Number.MAX_SAFE_INTEGER
		return options.stylize(this.constructor.name, options) + ' ' + inspect(this.toJSON(), options)
	}

	toJSON () {
		const json: Record<string, any> = Object.assign({}, this)
		Object.getOwnPropertyNames(Object.getPrototypeOf(this))
			.filter((k) => k !== 'constructor')
			.forEach((key) => {
				const value = this[key]
				json[key] = value?.toJSON?.() ?? value
			})
		return json
	}

	toString () {
		return JSON.stringify(this.toJSON())
	}
}

function WrapWithProperties (): { new <Keys extends Record<string, any>>(keys: Keys, access?: Accessor<Keys>): (__Wrapped<any> & Keys) } {
	return __Wrapped as any
}

// @ts-ignore
export class ClassPropertiesWrapper<Keys extends Record<string, any>> extends WrapWithProperties()<Keys> {}
