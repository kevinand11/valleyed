export type DeepOmit<T, K, A = never> = T extends any[]
	? DeepOmit<T[number], K, A>[]
	: T extends (...args: any[]) => any
		? never
		: T extends Array<infer U>
			? DeepOmit<U, K, A>[]
			: {
					[P in keyof T as P extends K | A ? never : P]: DeepOmit<
						T[P],
						K extends `${Exclude<P, symbol>}.${infer R}` ? R : never,
						A
					>
				}

export type JSONPrimitives = string | number | boolean | null
export type JSONValue = JSONPrimitives | JSONValue[] | { [k: string]: JSONValue }
export type JSONValueOf<T> = Prettify<
	IsAny<T> extends true
		? {}
		: T extends JSONPrimitives
			? T
			: IsInUnion<T, undefined> extends true
				? JSONValueOf<Exclude<T, undefined>> | undefined
				: T extends Array<infer U>
					? JSONValueOf<U>[]
					: T extends { toJSON: (...args: any[]) => any }
						? ReturnType<T['toJSON']>
						: T extends Function
							? never
							: T extends object
								? {
										[K in keyof T as IsInTypeList<JSONValueOf<T[K]>, [never, undefined]> extends true
											? never
											: K]: JSONValueOf<T[K]>
									}
								: never
>

type ConstructorType<T> = abstract new (...args: any[]) => T
export type Prettify<T> =
	T extends InstanceType<ConstructorType<infer C>>
		? C
		: T extends object
			? {
					[K in keyof T]: T[K]
				} & {}
			: T

export type EnumToStringUnion<T extends Record<string, string | number>> = `${T[keyof T]}`

export type DeepPartial<T> = { [P in keyof T]?: DeepPartial<T[P]> }

export type DistributiveOmit<T, K extends PropertyKey> = T extends any ? Omit<T, K> : never

type IsInUnion<T, U> = U extends T ? true : false
export type IsAny<T> = 0 extends 1 & T ? true : false
export type IsType<A, B> = Exclude<A, B> | Exclude<B, A> extends never ? true : false
export type IsInTypeList<T, L extends any[]> = L extends [infer First, ...infer Remaining]
	? IsType<First, T> extends true
		? true
		: IsInTypeList<T, Remaining>
	: false

type StopTypes = number | string | boolean | symbol | bigint | Date
type ExcludedTypes = (...args: any[]) => any
type Dot<T extends string, U extends string> = '' extends U ? T : `${T}.${U}`
export type Paths<T, D = never> = T extends StopTypes
	? ''
	: T extends object
		? {
				[K in keyof T & string]: T[K] extends StopTypes ? K : T[K] extends ExcludedTypes ? D : K | Dot<K, Paths<T[K]>>
			}[keyof T & string]
		: T extends readonly any[]
			? Paths<T[number]>
			: D

export interface JsonSchema {
	type?: string | string[]
	format?: string
	pattern?: string
	minimum?: number
	maximum?: number
	exclusiveMinimum?: number
	exclusiveMaximum?: number
	minLength?: number
	maxLength?: number
	minItems?: number
	maxItems?: number
	items?: JsonSchema | JsonSchema[]
	properties?: Record<string, JsonSchema>
	required?: string[]
	additionalProperties?: boolean | JsonSchema
	propertyNames?: JsonSchema
	enum?: any[]
	anyOf?: JsonSchema[]
	allOf?: JsonSchema[]
	oneOf?: JsonSchema[]
	const?: any
	not?: JsonSchema
	title?: string
	description?: string
	default?: any
	examples?: any[]
	contentMediaType?: string | string[]
}
