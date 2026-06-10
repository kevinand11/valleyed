import { isType } from './isType'

function getDiff(val1: any, val2: any, parent?: string) {
	if (!isType.object(val1) || !isType.object(val2)) return []
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
		if (isType.object(obj1) && isType.object(obj2)) diff.push(...getDiff(obj1, obj2, parentKey))
		else if (!equal(obj1, obj2)) diff.push(parentKey)
	}
	return diff
}

export function equal(v1: unknown, v2: unknown): boolean {
	if (v1 === v2) return true

	if (isType.string(v1)) return v1 === v2
	if (isType.number(v1)) return v1 === v2
	if (isType.bigint(v1)) return v1 === v2
	if (isType.boolean(v1)) return v1 === v2
	if (isType.null(v1)) return v1 === v2
	if (isType.undefined(v1)) return v1 === v2
	if (isType.function(v1)) return v1 === v2

	if (isType.regex(v1)) return isType.regex(v2) && v1.source === v2.source
	if (isType.nan(v1)) return isType.nan(v2)
	if (isType.date(v1)) return isType.date(v2) && v1.getTime() === v2.getTime()

	const [val1, val2] = [v1, v2].map((v) => {
		if (isType.map(v)) return Object.fromEntries(v.entries())
		if (isType.set(v)) return [...v]
		return v
	})

	if (val1 === val2) return true

	if (isType.array(val1)) {
		if (!isType.array(val2)) return false
		if (val1.length !== val2.length) return false
		return val1.every((c, i) => equal(c, val2.at(i)))
	}

	if (isType.object(val1) && isType.object(val2)) {
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
				merged[key] = isType.object(obj) ? deepMerge(obj, merged[key] ?? {}) : obj
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
	if (isType.undefined(v1)) return v2
	if (isType.undefined(v2)) return v1
	if (isType.array(v1) && isType.array(v2)) {
		return Array.from({ length: Math.max(v1.length, v2.length) }, (_, i) => merge(v1[i], v2[i]))
	}
	if (isType.object(v1) && isType.object(v2)) {
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
