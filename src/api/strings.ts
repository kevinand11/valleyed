import { isEmail, isLengthOf, isMaxOf, isMinOf, isString, isUrl } from '../rules'
import { VCore } from './core'
import { capitalizeText, stripHTML, trimToLength } from '../utils/functions'

export class VString extends VCore<string> {
	constructor (err?: string) {
		super()
		this.addTyping(isString(err))
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
		return this.addSanitizer((val) => val.trim())
	}

	lower () {
		return this.addSanitizer((val) => val.toLowerCase())
	}

	upper () {
		return this.addSanitizer((val) => val.toUpperCase())
	}

	capitalize () {
		return this.addSanitizer((val) => capitalizeText(val))
	}

	stripHTML () {
		return this.addSanitizer((val) => stripHTML(val))
	}

	slice (length: number) {
		return this.addSanitizer((val) => trimToLength(val, length))
	}
}
