const type = {
	string: (v: unknown): v is string => v?.constructor?.name === 'String',
	regex: (v: unknown): v is RegExp => v?.constructor?.name === 'RegExp',
	symbol: (v: unknown): v is Symbol => v?.constructor?.name === 'Symbol',
	function: (v: unknown): v is Function => v?.constructor?.name === 'Function',
	bigint: (v: unknown): v is BigInt => v?.constructor?.name === 'BigInt',
	number: (v: unknown): v is number => v?.constructor?.name === 'Number' && !Number.isNaN(v),
	nan: (v: unknown): v is number => Number.isNaN(v),
	null: (v: unknown): v is null => v === null,
	undefined: (v: unknown): v is undefined => v === undefined,
	boolean: (v: unknown): v is boolean => v?.constructor?.name === 'Boolean',
	array: (v: unknown): v is unknown[] => Array.isArray(v),
	date: (v: unknown): v is Date => v?.constructor?.name === 'Date' && v instanceof Date && !Number.isNaN(v.getTime()),
	set: (value: unknown): value is Set<unknown> => value?.constructor?.name === 'Set',
	object: (value: unknown): value is object => value?.constructor?.name === 'Object',
	map: (value: unknown): value is Map<unknown, unknown> => value?.constructor?.name === 'Map',
}

function getDiff(val1: any, val2: any, parent?: string) {
	if (!type.object(val1) || !type.object(val2)) return []
	const keys = [...new Set(Object.keys(val1).concat(Object.keys(val2)))]
	const diff: string[] = []
	for (const key of keys) {
		const parentKey = (parent ? `${parent}.` : '') + key
		if (!(key in val1) || !(key in val2)) {
			diff.push(parentKey)
			continue
		}
		const obj1 = val1[key]
		const obj2 = val2[key]
		if (type.object(obj1) && type.object(obj2)) diff.push(...getDiff(obj1, obj2, parentKey))
		else if (!equal(obj1, obj2)) diff.push(parentKey)
	}
	return diff
}

export function equal(v1: unknown, v2: unknown): boolean {
	const [val1, val2] = [v1, v2].map((v) => {
		if (type.map(v)) return Object.fromEntries(v.entries())
		if (type.set(v)) return [...v]
		return v
	})

	if (val1 === val2) return true

	if (type.string(val1)) return val1 === val2
	if (type.number(val1)) return val1 === val2
	if (type.bigint(val1)) return val1 === val2
	if (type.boolean(val1)) return val1 === val2
	if (type.null(val1)) return val1 === val2
	if (type.undefined(val1)) return val1 === val2
	if (type.function(val1)) return val1 === val2

	if (type.regex(val1)) return type.regex(val2) && val1.source === val2.source
	if (type.nan(val1)) return type.nan(val2)
	if (type.date(val1)) return type.date(val2) && val1.getTime() === val2.getTime()
	if (type.array(val1)) {
		if (!type.array(val2)) return false
		if (val1.length !== val2.length) return false
		return val1.every((c, i) => equal(c, val2.at(i)))
	}

	if (type.object(val1) && type.object(val2)) {
		const keys1 = Object.keys(val1 ?? {})
		const keys2 = Object.keys(val2 ?? {})
		if (keys1.length !== keys2.length) return false
		const keys = [...new Set(keys1.concat(keys2))]
		return keys.every((key) => key in val1 && key in val2 && equal(val1[key], val2[key]))
	}

	return false
}

export function diff(val1: unknown, val2: unknown) {
	return getDiff(val1, val2)
}

export function from(keys: string[]) {
	const deepMerge = (from: object, to: object) =>
		Object.entries(from ?? {}).reduce(
			(merged, [key, obj]) => {
				merged[key] = type.object(obj) ? deepMerge(obj, merged[key] ?? {}) : obj
				return merged
			},
			{ ...to },
		)

	const formObject = (key: string) =>
		key
			.split('.')
			.reverse()
			.reduce<Record<string, any>>((acc, k) => ({ [k]: acc ?? true }), null as any)

	return keys.map(formObject).reduce(deepMerge, {})
}

export function merge(v1: unknown, v2: unknown) {
	if (type.null(v1) || type.undefined(v1)) return v2
	if (type.null(v2) || type.undefined(v2)) return v1
	if (type.array(v1) && type.array(v2)) {
		return Array.from({ length: Math.max(v1.length, v2.length) }, (_, i) => merge(v1[i], v2[i]))
	}
	if (type.object(v1) && type.object(v2)) {
		const keys = new Set([...Object.keys(v1), ...Object.keys(v2)])
		return Array.from(keys).reduce(
			(acc, key) => {
				acc[key] = merge(v1[key], v2[key])
				return acc
			},
			{} as Record<string, any>,
		)
	}
	return v2
}
