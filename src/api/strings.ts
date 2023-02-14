import { isEmail, isLengthOf, isMaxOf, isMinOf, isString, isUrl } from '../rules'
import { capitalize, stripHTML, trimToLength } from '../utils/functions'
import { VCore } from './core'

export class VString extends VCore<string> {
	constructor (err?: string) {
		super()
		this.addTyping(isString(err))
	}

	has (length: number, stripHTML = false, err?: string) {
		return this.addRule(isLengthOf(length,  stripHTML, err))
	}

	min (length: number, stripHTML = false,err?: string) {
		return this.addRule(isMinOf(length, stripHTML, err))
	}

	max (length: number, stripHTML = false, err?: string) {
		return this.addRule(isMaxOf(length,  stripHTML, err))
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
		return this.addSanitizer((val) => capitalize(val))
	}

	stripHTML () {
		return this.addSanitizer((val) => stripHTML(val))
	}

	slice (length: number) {
		return this.addSanitizer((val) => trimToLength(val, length))
	}
}
