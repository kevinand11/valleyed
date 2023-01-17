import { VString } from './strings'
import { VNumber } from './numbers'
import { VBoolean } from './booleans'

export const force = {
	string: () => {
		const v = new VString()
		v.addSanitizer((value) => String(value))
		return v
	},
	number: () => {
		const v = new VNumber()
		v.addSanitizer((value) => Number(value))
		return v
	},
	boolean: () => {
		const v = new VBoolean()
		v.addSanitizer((value) => Boolean(value))
		return v
	}
}
