import { check, Rule, Sanitizer, Transformer } from '../utils/rules'

export class VBase<I, O = I> {
	protected _options = {
		original: false,
		required: true,
		nullable: false,
		default: undefined as unknown as (() => I) | I
	}
	#sanitizers: Sanitizer<I>[] = []
	#typings: Rule<I>[] = []
	#rules: Rule<I>[] = []
	#forced = false

	get forced () {
		return this.#forced
	}

	static createType<C extends VBase<any>, A extends Array<any>> (c: new (...args: A) => C) {
		return ((...args: A) => new c(...args))
	}

	static createForcedType<C extends VBase<any>, I, T extends any[] = any[]> (c: new (...args: T) => C, conv: (arg: unknown) => I) {
		return ((...args: T) => {
			return new c(...args).#setForced()
				.addSanitizer((value) => conv(value as any))
		})
	}

	parse (input: unknown) {
		let value = input as I
		if (this.#forced && this.#sanitizers.length > 0) value = this.#sanitizers[0](value)
		const typeCheck = check<I>(value, this.#typings, this._options)
		if (!typeCheck.valid) return {
			errors: typeCheck.errors,
			valid: typeCheck.valid,
			value: typeCheck.value
		}
		const sanitizedValue = this.#sanitize(value)
		const v = check<I>(sanitizedValue, this.#rules, this._options)
		if (!v.valid) return {
			errors: v.errors,
			valid: v.valid,
			value: v.value
		}
		const retValue: O = this._options.original ? value as unknown as O : this.#transform(v.value)
		return {
			errors: v.errors,
			valid: v.valid,
			value: retValue
		}
	}

	addTyping (rule: Rule<I>) {
		this.#typings.push(rule)
		return this
	}

	addRule (rule: Rule<I>) {
		this.#rules.push(rule)
		return this
	}

	addSanitizer (sanitizer: Sanitizer<I>) {
		this.#sanitizers.push(sanitizer)
		return this
	}

	setTransform (transformer: Transformer<I, O>) {
		this.#transform = transformer
		return this
	}

	protected _setOption<K extends keyof typeof this._options> (key: K, value: typeof this._options[K]) {
		this._options[key] = value
		return this
	}

	protected clone (c: VBase<any>) {
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

	#transform: Transformer<I, O> = (v) => v as unknown as O

	#sanitize (value: I) {
		for (const sanitizer of this.#sanitizers) value = sanitizer(value)
		if (value !== undefined) return value
		const def = this._options.default
		// @ts-ignore
		if (def !== undefined) return typeof def === 'function' ? def() : def
		return undefined as unknown as I
	}
}

export type ExtractI<T extends VBase<any>> = T extends VBase<infer I, any> ? I : never
export type ExtractO<T extends VBase<any>> = T extends VBase<any, infer O> ? O : never