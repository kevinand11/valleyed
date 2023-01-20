import { check, Rule, Sanitizer } from '../utils/rules'

export class VBase<I, O = I> {
	protected _options = {
		original: false,
		required: true,
		nullable: false,
		default: undefined as unknown as O
	}
	private _sanitizers: Sanitizer<I, O>[] = []
	private _rules: Rule<O>[] = []

	get rules () {
		return this._rules
	}

	private _forced = false as (I extends O ? false : true)

	get forced () {
		return this._forced
	}

	parse (value: I) {
		const sanitizedValue = this.sanitize(value)
		const v = check(sanitizedValue, this._rules, this._options)
		return {
			valid: v.valid,
			error: v.errors[0] ?? '',
			value: (this._options.original ? value : sanitizedValue) as unknown as O
		}
	}

	sanitize (value: I) {
		for (const sanitizer of this._sanitizers) value = sanitizer(value) as any
		if (value !== undefined) return value as unknown as O
		if (this._options.default) return this._options.default
		return undefined as unknown as O
	}

	addRule (rule: Rule<O>) {
		this._rules.push(rule)
		return this
	}

	addSanitizer (sanitizer: Sanitizer<I, O>) {
		this._sanitizers.push(sanitizer)
		return this
	}

	protected clone (c: VBase<I, O>) {
		this._options = c._options
		this._forced = c._forced as any
		this._rules = [...c._rules]
		this._sanitizers = [...c._sanitizers]
	}
}