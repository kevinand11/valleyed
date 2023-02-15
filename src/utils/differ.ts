export class Differ {
	static #type () {
		return {
			string: (value: any) => value?.constructor?.name === 'String',
			regex: (value: any) => value?.constructor?.name === 'RegExp',
			symbol: (value: any) => value?.constructor?.name === 'Symbol',
			function: (value: any) => value?.constructor?.name === 'Function',
			bigint: (value: any) => value?.constructor?.name === 'BigInt',
			number: (value: any) => value?.constructor?.name === 'Number' && !Number.isNaN(value),
			nan: (value: any) => Number.isNaN(value),
			null: (value: any) => value === null,
			undefined: (value: any) => value === undefined,
			boolean: (value: any) => value?.constructor?.name === 'Boolean',
			array: (value: any) => Array.isArray(value),
			date: (value: any) => value?.constructor?.name === 'Date' && !Number.isNaN(value.getTime()),
			set: (value: any) => value?.constructor?.name === 'Set',
			object: (value: any) => value?.constructor?.name === 'Object',
			map: (value: any) => value?.constructor?.name === 'Map'
		}
	}

	static equal (v1: any, v2: any): boolean {
		const [val1, val2] = [v1, v2].map((v) => {
			// @ts-ignore
			if (Differ.#type().map(v)) return Object.fromEntries(...val1.entries())
			if (Differ.#type().set(v)) return [...v]
			return v
		})

		if (Differ.#type().symbol(val1)) return val1 === val2
		if (Differ.#type().string(val1)) return val1 === val2
		if (Differ.#type().regex(val1)) return Differ.#type().regex(val2) && val1.source === val2.source
		if (Differ.#type().number(val1)) return val1 === val2
		if (Differ.#type().nan(val1)) return Differ.#type().nan(val2)
		if (Differ.#type().bigint(val1)) return val1 === val2
		if (Differ.#type().boolean(val1)) return val1 === val2
		if (Differ.#type().null(val1)) return val1 === val2
		if (Differ.#type().undefined(val1)) return val1 === val2
		if (Differ.#type().function(val1)) return val1 === val2
		if (Differ.#type().date(val1)) return val1?.getTime() === val2?.getTime()
		if (Differ.#type().array(val1)) {
			if (!Differ.#type().array(val2)) return false
			if (val1.length !== val2.length) return false
			return val1.every((c, i) => Differ.equal(c, val2.at(i)))
		}
		if (Differ.#type().object(val1)) {
			if (!Differ.#type().object(val2)) return false
			const keys1 = Object.keys(val1)
			const keys2 = Object.keys(val2)
			if (keys1.length !== keys2.length) return false
			const keys = [...new Set(keys1.concat(keys2))]
			return keys.every((key) => key in val1 && key in val2 && Differ.equal(val1[key], val2[key]))
		}
		return val1 === val2
	}

	static getDiff (val1: any, val2: any, parent?: string) {
		if (!Differ.#type().object(val1) || !Differ.#type().object(val2)) return []
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
			if (Differ.#type().object(obj1) && Differ.#type().object(obj2)) diff.push(...Differ.getDiff(obj1, obj2, parentKey))
			else if (!Differ.equal(obj1, obj2)) diff.push(parentKey)
		}
		return diff
	}

	static from (keys: string[]) {
		const deepMerge = (from, to) => Object.keys(from)
			.reduce((merged, key) => {
				const obj = from[key]
				merged[key] = Differ.#type().object(obj) ? deepMerge(obj, merged[key] ?? {}) : obj
				return merged
			}, { ...to })

		const formObject = (key: string) => key.split('.').reverse().reduce((acc, k) => ({ [k]: acc ?? true }), null as Record<string, any> | null)

		return keys.map(formObject).reduce(deepMerge, {})
	}
}