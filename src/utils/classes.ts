import util from 'util'

import { wrapInTryCatch } from './functions'
import { DeepOmit, IsType, JSONValueOf } from './types'

if (util?.inspect?.defaultOptions) {
	util.inspect.defaultOptions.depth = Number.MAX_SAFE_INTEGER
	util.inspect.defaultOptions.getters = true
	util.inspect.defaultOptions.numericSeparator = true
}

const customInspectSymbol = Symbol.for('nodejs.util.inspect.custom')

type Accessor<Keys extends object> = {
	get: <Key extends keyof Keys>(key: Key, keysObj: Keys) => Keys[Key]
	set: <Key extends keyof Keys>(key: Key, value: Keys[Key], keysObj: Keys) => void
}

type JSONOf<T, K, I, A> = JSONValueOf<IsType<K, any> extends true ? Record<string, any> : DeepOmit<T, I, A>>

function WrapWithProperties(): { new <Keys extends Record<string, unknown>>(): Keys } {
	return class {
		[customInspectSymbol](_, options, inspect) {
			options.getters = true
			options.numericSeparator = true
			options.depth = Number.MAX_SAFE_INTEGER
			return options.stylize(this.constructor.name, options) + ' ' + inspect((this as any).toJSON?.() ?? this, options)
		}
	} as any
}

// @ts-expect-error invalid extends
class __Root<Keys extends object> extends WrapWithProperties()<Keys> {}

export class DataClass<Keys extends object, Ignored extends string = never> extends __Root<Keys> {
	public __ignoreInJSON: ReadonlyArray<Ignored> = []

	constructor(
		keys: Keys,
		access: Accessor<Keys> = {
			get: (key, keys) => keys[key],
			set: (key, value, keys) => {
				keys[key] = value
			},
		},
	) {
		super()
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

	toJSON(includeIgnored = false): JSONOf<this, Keys, Ignored, '__pipe' | '__ignoreInJSON' | '__update' | 'toJSON'> {
		const json: Record<string, any> = {}
		Object.keys(this)
			.concat(Object.getOwnPropertyNames(Object.getPrototypeOf(this)))
			.forEach((key) => {
				const value = this[key]
				if (typeof value === 'function' || value === undefined) return
				json[key] = (value as any)?.toJSON?.(includeIgnored) ?? wrapInTryCatch(() => structuredClone(value), value)
			})
		const keysToDelete = ['__ignoreInJSON'].concat(...(includeIgnored !== true ? this.__ignoreInJSON : []))
		keysToDelete.forEach((k: string) => deleteKeyFromObject(json, k.split('.')))
		return json as any
	}

	toString(includeIgnored = false) {
		return JSON.stringify(this.toJSON(includeIgnored))
	}
}

function deleteKeyFromObject(obj: Record<string, any>, keys: string[]) {
	if (obj === undefined || obj === null) return
	const isArray = Array.isArray(obj)
	if (keys.length === 1 && !isArray) return delete obj[keys[0]]
	if (isArray) return obj.map((v) => deleteKeyFromObject(v, keys))
	return deleteKeyFromObject(obj[keys[0]], keys.slice(1))
}
