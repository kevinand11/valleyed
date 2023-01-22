import { hasLengthOf, hasMaxOf, hasMinOf, isArray, isArrayOf } from '../rules'
import { VCore } from './core'
import { makeRule } from '../utils/rules'

export class VArray<I, O, Tr> extends VCore<I[], O[], Tr[]> {
	constructor (comparer: VCore<I, O, Tr>, err?: string) {
		super()
		this.addTyping(isArray(err))
		this.addRule(makeRule((value) => {
			const mapped = value.reduce((acc, cur) => {
				const comp = comparer.parse(cur as any)
				acc[0].push(comp.value)
				acc[1].push(comp.valid)
				return acc
			}, [[] as Tr[], [] as boolean[]] as const)
			return isArrayOf<O>((_, i) => mapped[1][i], err)(mapped[0] as any)
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

	set (keyFn: (v: O) => any = (v) => v) {
		return this.addSanitizer((val: O[]) => {
			const finalArr: O[] = []
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
