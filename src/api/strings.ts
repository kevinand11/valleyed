import { isEmail, isLengthOf, isMaxOf, isMinOf, isString, isUrl } from '../rules'
import { VCore } from './core'
import { capitalizeText, extractTextFromHTML, trimToLength } from '../utils/functions'

export class VString<I = string> extends VCore<I, string> {
	static create<I = string> (err?: string) {
		const v = new VString<I>()
		v.addRule(isString(err))
		return v
	}

	has (length: number, err?: string) {
		return this.addRule(isLengthOf(length, err))
	}

	min (length: number, err?: string) {
		return this.addRule(isMinOf(length, err))
	}

	max (length: number, err?: string) {
		return this.addRule(isMaxOf(length, err))
	}

	email (err?: string) {
		return this.addRule(isEmail(err))
	}

	url (err?: string) {
		return this.addRule(isUrl(err))
	}

	trim () {
		return this.addSanitizer((val: string) => val.trim())
	}

	lower () {
		return this.addSanitizer((val: string) => val.toLowerCase())
	}

	upper () {
		return this.addSanitizer((val: string) => val.toUpperCase())
	}

	capitalize () {
		return this.addSanitizer((val: string) => capitalizeText(val))
	}

	stripHTML () {
		return this.addSanitizer((val: string) => extractTextFromHTML(val))
	}

	slice (length: number) {
		return this.addSanitizer((val: string) => trimToLength(val, length))
	}
}
