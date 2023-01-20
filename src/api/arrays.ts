import { hasLengthOf, hasMaxOf, hasMinOf, isArray, isArrayOf } from '../rules'
import { VCore } from './core'
import { makeRule } from '../utils/rules'

export class VArray<T> extends VCore<T[]> {
	static create<T> (comparer: VCore<T, T>, type: string, err?: string) {
		const v = new VArray<T>()
		v.addTyping(isArray(err))
		v.addRule(makeRule<T[]>((value: T[]) => {
			const mapped = value.reduce((acc, cur) => {
				const comp = comparer.parse(cur)
				acc[0].push(comp.value)
				acc[1].push(comp.valid)
				return acc
			}, [[] as T[], [] as boolean[]] as const)
			return isArrayOf<T>((_, i) => mapped[1][i], type, err)(mapped[0])
		}))
		return v
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
