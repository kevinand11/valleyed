import { check, Rule, Sanitizer } from '../utils/rules'

export class VBase<I, O = I> {
	protected _options = {
		original: false,
		required: true,
		nullable: false,
		default: undefined as unknown as O
	}
	#sanitizers: Sanitizer<O>[] = []
	#typings: Rule<O>[] = []
	#rules: Rule<O>[] = []
	#forced = false as (I extends O ? false : true)

	get rules () {
		return this.#rules
	}

	get forced () {
		return this.#forced
	}

	private set forced (forced) {
		this.#forced = forced
	}

	parse (input: I) {
		let value = input as unknown as O
		if (this.forced && this.#sanitizers.length > 0) value = this.#sanitizers[0](value)
		const typeCheck = check(value, this.#typings, this._options)
		if (!typeCheck.valid) return typeCheck
		const sanitizedValue = this.#sanitize(value)
		const v = check(sanitizedValue, this.#rules, this._options)
		return { ...v, value: this._options.original ? value : v.value }
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

	protected clone (c: VBase<I, O>) {
		this._options = c._options
		this.#forced = c.#forced as any
		this.#rules = [...c.#rules]
		this.#sanitizers = [...c.#sanitizers]
	}

	#sanitize (value: O) {
		for (const sanitizer of this.#sanitizers) value = sanitizer(value)
		if (value !== undefined) return value
		if (this._options.default) return this._options.default
		return undefined as unknown as O
	}
}