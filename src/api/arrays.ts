import { hasLengthOf, hasMaxOf, hasMinOf, isArray, isArrayOf } from '../rules'
import { VCore } from './core'

export class VArray<T> extends VCore<T[]> {
	constructor (comparer: VCore<T, T>, type: string, err?: string) {
		super()
		this.addRule(isArray())
		this.addRule(isArrayOf<T>((v) => comparer.parse(v).valid, type, err))
	}

	has (length: number, err?: string) {
		return this.addRule(hasLengthOf(length, err))
	}

	min (length: number, err?: string) {
		return this.addRule(hasMinOf(length, err))
	}

	max (length: number, err?: string) {
		return this.addRule(hasMaxOf(length, err))
	}

	set (keyFn: (v: T) => any = (v) => v) {
		return this.addSanitizer((val: T[]) => {
			const finalArr: T[] = []
			const obj: Record<any, boolean> = {}
			val.forEach((v) => {
				const key = keyFn(v)
				if (obj[key]) return
				obj[key] = true
				finalArr.push(v)
			})
			return finalArr
		})
	}
}
