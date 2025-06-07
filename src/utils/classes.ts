import util from 'util'

import { wrapInTryCatch } from './functions'
import { DeepOmit, JSONValue } from './types'

if (util?.inspect?.defaultOptions) {
	util.inspect.defaultOptions.depth = Number.MAX_SAFE_INTEGER
	util.inspect.defaultOptions.getters = true
	util.inspect.defaultOptions.numericSeparator = true
}

const customInspectSymbol = Symbol.for('nodejs.util.inspect.custom')

type Accessor<Keys extends Record<string, any>> = {
	get: <Key extends keyof Keys>(key: Key, keysObj: Keys) => Keys[Key]
	set: <Key extends keyof Keys>(key: Key, value: Keys[Key], keysObj: Keys) => void
}

class __Wrapped<Keys extends Record<string, any>, Ignored extends string = never> {
	public readonly __ignoreInJSON: Ignored[] = []

	constructor(
		keys: Keys,
		access: Accessor<Keys> = {
			get: (key, keys) => keys[key],
			set: (key, value, keys) => {
				keys[key] = value
			},
		},
	) {
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

	[customInspectSymbol](_, options, inspect) {
		options.getters = true
		options.numericSeparator = true
		options.depth = Number.MAX_SAFE_INTEGER
		return options.stylize(this.constructor.name, options) + ' ' + inspect(this.toJSON(), options)
	}

	toJSON(includeIgnored = false): JSONValue<DeepOmit<this, Ignored, '__ignoreInJSON'>> {
		const json: Record<string, any> = {}
		Object.keys(this)
			.concat(Object.getOwnPropertyNames(Object.getPrototypeOf(this)))
			.forEach((key) => {
				const value = this[key]
				if (typeof value === 'function' || value === undefined) return
				json[key] = value?.toJSON?.(includeIgnored) ?? wrapInTryCatch(() => structuredClone(value), value)
			})
		const keysToDelete = ['__ignoreInJSON'].concat(...(includeIgnored !== true ? this.__ignoreInJSON : []))
		keysToDelete.forEach((k: string) => deleteKeyFromObject(json, k.split('.')))
		return json as any
	}

	toString(includeIgnored = false) {
		return JSON.stringify(this.toJSON(includeIgnored))
	}
}

function WrapWithProperties(): {
	new <Keys extends Record<string, any>, Ignored extends string = never>(
		keys: Keys,
		access?: Accessor<Keys>,
	): __Wrapped<Keys, Ignored> & Keys
} {
	return __Wrapped as any
}

// @ts-expect-error invalid extends
export class ClassPropertiesWrapper<Keys extends Record<string, any>, Ignored extends string = never> extends WrapWithProperties()<
	Keys,
	Ignored
> {}

function deleteKeyFromObject(obj: Record<string, any>, keys: string[]) {
	if (obj === undefined || obj === null) return
	const isArray = Array.isArray(obj)
	if (keys.length === 1 && !isArray) return delete obj[keys[0]]
	if (isArray) return obj.map((v) => deleteKeyFromObject(v, keys))
	return deleteKeyFromObject(obj[keys[0]], keys.slice(1))
}
