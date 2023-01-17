import { isEmail, isLongerThan, isLongerThanOrEqualTo, isShorterThan, isShorterThanOrEqualTo, isString } from '../rules'
import { VCore } from './core'
import { capitalizeText, extractTextFromHTML, trimToLength } from '../santizers'

export class VString extends VCore<string> {
	constructor (err?: string) {
		super()
		this.addRule((val: string) => isString(val, err))
	}

	gt (length: number, err?: string) {
		return this.addRule((val: string) => isLongerThan(val, length, err))
	}

	gte (length: number, err?: string) {
		return this.addRule((val: string) => isLongerThanOrEqualTo(val, length, err))
	}

	lt (length: number, err?: string) {
		return this.addRule((val: string) => isShorterThan(val, length, err))
	}

	lte (length: number, err?: string) {
		return this.addRule((val: string) => isShorterThanOrEqualTo(val, length, err))
	}

	email (err?: string) {
		return this.addRule((val: string) => isEmail(val, err))
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
