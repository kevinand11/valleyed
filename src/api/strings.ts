import {
	isEmail,
	isLengthEqual,
	isLongerThan,
	isLongerThanOrEqualTo,
	isShorterThan,
	isShorterThanOrEqualTo,
	isString,
	isUrl
} from '../rules'
import { VCore } from './core'
import { capitalizeText, extractTextFromHTML, trimToLength } from '../santizers'

export class VString extends VCore<string> {
	constructor (err?: string) {
		super()
		this.addRule(isString(err))
	}

	has (length: number, err?: string) {
		return this.addRule(isLengthEqual(length, err))
	}

	gt (length: number, err?: string) {
		return this.addRule(isLongerThan(length, err))
	}

	gte (length: number, err?: string) {
		return this.addRule(isLongerThanOrEqualTo(length, err))
	}

	lt (length: number, err?: string) {
		return this.addRule(isShorterThan(length, err))
	}

	lte (length: number, err?: string) {
		return this.addRule(isShorterThanOrEqualTo(length, err))
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

	extractHTML () {
		return this.addSanitizer((val: string) => extractTextFromHTML(val))
	}

	slice (length: number) {
		return this.addSanitizer((val: string) => trimToLength(val, length))
	}
}
