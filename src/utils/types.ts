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
export type JSONValue<T> = T extends JSONPrimitives
	? T
	: T extends Array<infer U>
		? JSONValue<U>[]
		: T extends Function
				? never
				: T extends object
					? {
							[K in keyof T as JSONValue<T[K]> extends never
								? never
								: JSONValue<T[K]> extends undefined
									? never
									: K]: JSONValue<T[K]>
						}
					: never