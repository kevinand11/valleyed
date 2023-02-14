export class Differ {
	get #type () {
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

	areEqual (v1: any, v2: any): boolean {
		const [val1, val2] = [v1, v2].map((v) => {
			// @ts-ignore
			if (this.#type.map(v)) return Object.fromEntries(...val1.entries())
			if (this.#type.set(v)) return [...v]
			return v
		})

		if (this.#type.symbol(val1)) return val1 === val2
		if (this.#type.string(val1)) return val1 === val2
		if (this.#type.regex(val1)) return this.#type.regex(val2) && val1.source === val2.source
		if (this.#type.number(val1)) return val1 === val2
		if (this.#type.nan(val1)) return this.#type.nan(val2)
		if (this.#type.bigint(val1)) return val1 === val2
		if (this.#type.boolean(val1)) return val1 === val2
		if (this.#type.null(val1)) return val1 === val2
		if (this.#type.undefined(val1)) return val1 === val2
		if (this.#type.function(val1)) return val1 === val2
		if (this.#type.date(val1)) return val1?.getTime() === val2?.getTime()
		if (this.#type.array(val1)) {
			if (!this.#type.array(val2)) return false
			if (val1.length !== val2.length) return false
			return val1.every((c, i) => this.areEqual(c, val2.at(i)))
		}
		if (this.#type.object(val1)) {
			if (!this.#type.object(val2)) return false
			const keys1 = Object.keys(val1)
			const keys2 = Object.keys(val2)
			if (keys1.length !== keys2.length) return false
			const keys = [...new Set(keys1.concat(keys2))]
			return keys.every((key) => key in val1 && key in val2 && this.areEqual(val1[key], val2[key]))
		}
		return val1 === val2
	}

	getDiff (val1: any, val2: any, parent?: string) {
		if (!this.#type.object(val1) || !this.#type.object(val2)) return []
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
			if (this.#type.object(obj1) && this.#type.object(obj2)) diff.push(...this.getDiff(obj1, obj2, parentKey))
			else if (!this.areEqual(obj1, obj2)) diff.push(parentKey)
		}
		return diff
	}

	from (keys: string[]) {
		const deepMerge = (from, to) => Object.keys(from)
			.reduce((merged, key) => {
				const obj = from[key]
				merged[key] = this.#type.object(obj) ? deepMerge(obj, merged[key] ?? {}) : obj
				return merged
			}, { ...to })

		const formObject = (key: string) => key.split('.').reverse().reduce((acc, k) => ({ [k]: acc ?? true }), null as Record<string, any> | null)

		return keys.map(formObject).reduce(deepMerge, {})
	}
}