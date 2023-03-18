import { hasLengthOf, hasMaxOf, hasMinOf, isArray, isArrayOf } from '../rules'
import { makeRule } from '../utils/rules'
import { VCore } from './core'

export class VArray<I> extends VCore<I[]> {
	constructor (comparer: VCore<I>, err?: string) {
		super()
		this.addTyping(isArray(err))
		this.addTyping(makeRule<I[]>((value) => {
			const mapped = (value as I[] ?? []).reduce((acc, cur) => {
				const comp = comparer.parse(cur)
				acc[0].push(comp.value)
				acc[1].push(comp.valid)
				return acc
			}, [[] as any[], [] as boolean[]] as const)
			return isArrayOf<I>((_, i) => mapped[1][i], err)(mapped[0])
		}))
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

	set (keyFn: (v: I) => any = (v) => v) {
		return this.addSanitizer((val) => {
			const finalArr: I[] = []
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
