import { check, Rule, Sanitizer, Transformer } from '../utils/rules'

export class VBase<I, O = I, T = O> {
	protected _options = {
		original: false,
		required: true,
		nullable: false,
		default: undefined as unknown as O
	}
	#sanitizers: Sanitizer<O>[] = []
	#typings: Rule<O>[] = []
	#rules: Rule<O>[] = []
	#forced = false

	get forced () {
		return this.#forced
	}

	static createType<C extends VBase<any, any, any>, A extends Array<any>> (c: new (...args: A) => C) {
		return ((...args: A) => new c(...args))
	}

	static createForcedType<C extends VBase<unknown, any, any>, O, T extends any[] = any[]> (c: new (...args: T) => C, conv: (arg: unknown) => O) {
		return ((...args: T) => {
			return new c(...args).#setForced()
				.addSanitizer((value) => conv(value as any))
		})
	}

	parse (input: I) {
		let value = input as unknown as O
		if (this.#forced && this.#sanitizers.length > 0) value = this.#sanitizers[0](value)
		const typeCheck = check(value, this.#typings, this._options)
		if (!typeCheck.valid) return {
			errors: typeCheck.errors,
			valid: typeCheck.valid,
			value: typeCheck.value as unknown as T
		}
		const sanitizedValue = this.#sanitize(value)
		const v = check(sanitizedValue, this.#rules, this._options)
		const retValue: T = this._options.original ? value as unknown as T : this.#transform(v.value)
		return {
			errors: v.errors,
			valid: v.valid,
			value: retValue
		}
	}

	addTyping (rule: Rule<O>) {
		this.#typings.push(rule)
		return this
	}

	addRule (rule: Rule<O>) {
		this.#rules.push(rule)
		return this
	}

	addSanitizer (sanitizer: Sanitizer<O>) {
		this.#sanitizers.push(sanitizer)
		return this
	}

	setTransform (transformer: Transformer<O, T>) {
		this.#transform = transformer
		return this
	}

	protected _setOption<K extends keyof typeof this._options> (key: K, value: typeof this._options[K]) {
		this._options[key] = value
		return this
	}

	protected clone (c: VBase<I, O, any>) {
		this._options = c._options
		this.#forced = c.#forced
		this.#rules = [...c.#rules]
		this.#sanitizers = [...c.#sanitizers]
		this.#transform = c.#transform
		return this
	}

	#setForced () {
		this.#forced = true
		return this
	}

	#transform: Transformer<O, T> = (v) => v as unknown as T

	#sanitize (value: O) {
		for (const sanitizer of this.#sanitizers) value = sanitizer(value)
		if (value !== undefined) return value
		if (this._options.default) return this._options.default
		return undefined as unknown as O
	}
}

export type ExtractI<T extends VBase<any>> = T extends VBase<infer I, any, any> ? I : never
export type ExtractO<T extends VBase<any>> = T extends VBase<any, infer O, any> ? O : never
export type ExtractTr<T extends VBase<any>> = T extends VBase<any, any, infer Tr> ? Tr : never