import { v } from '../api'

const Base32Chars = '0123456789bcdefghjkmnpqrstuvwxyz'
const Base2Chars = '01'

const base10ToBaseX = (num: number, base: number, chars: string) => {
	const charsObj = Object.fromEntries(
		chars.toLowerCase().split('')
			.map((value, index) => [index, value])
	)
	const bits: string[] = []
	if (num === 0) return '0'
	while (num > 0) {
		bits.push(charsObj[num % base] ?? '')
		num = Math.floor(num / base)
	}
	return bits.reverse().join('')
}

const baseXToBase10 = (num: string, base: number, chars: string) => {
	const charsObj = Object.fromEntries(
		chars.toLowerCase().split('')
			.map((value, index) => [value, index])
	)

	return num
		.toLowerCase()
		.split('')
		.reduce((acc, cur, index, arr) => {
			const pos = charsObj[cur] ?? 0
			return acc + pos * Math.pow(base, arr.length - index - 1)
		}, 0)
}

const dichotomy = (min: number, max: number, bits: string) => {
	const res = bits
		.split('')
		.concat('')
		.reduce((acc, cur) => {
			const mid = (min + max) / 2
			const error = (max - min) / 2
			acc.mid = mid
			acc.error = error
			if (cur === '1') min = mid
			else max = mid
			return acc
		}, { mid: 0, error: 0 })
	const value = res.mid - res.error
	return { value, interval: res.error * 2 }
}

export class Geohash {
	static #coords (hash: string) {
		const base10 = baseXToBase10(hash, 32, Base32Chars)
		const base2 = base10ToBaseX(base10, 2, Base2Chars)
			.padStart(hash.length * 5, '0')

		const coords = base2
			.split('')
			.reduce((acc, cur, index) => {
				if (index % 2 === 0) {
					acc.long += cur
				} else {
					acc.lat += cur
				}
				return acc
			}, { lat: '', long: '' })

		return coords
	}

	static decode (hash: string): [number, number] {
		const valid = v.string().min(1).parse(hash)
		if (!valid.valid) throw new Error(valid.errors[0])

		const coords = this.#coords(hash)
		const lat = dichotomy(-90, 90, coords.lat).value
		const long = dichotomy(-180, 180, coords.long).value
		return [lat, long]
	}

	static encode (coords: [number, number]): string {
		const valid = v.tuple([v.number(), v.number()]).parse(coords)
		if (!valid.valid) throw new Error(valid.errors[0])

		let idx = 0, bit = 0,
			evenBit = true, geohash = ''
		const mins = [-90, -180], maxs = [90, 180]

		while (geohash.length < 18) {
			const key = evenBit ? 1 : 0
			const mid = (mins[key] + maxs[key]) / 2
			if (coords[key] >= mid) {
				idx = idx * 2 + 1
				mins[key] = mid
			} else {
				idx = idx * 2
				maxs[key] = mid
			}
			evenBit = !evenBit

			bit += 1
			if (bit === 5) {
				geohash += base10ToBaseX(idx, 32, Base32Chars)
				bit = idx = 0
			}
		}
		return geohash.replace(/0+$/, '')
	}

	static neighbors (hash: string) {
		const valid = v.string().min(1).parse(hash)
		if (!valid.valid) throw new Error(valid.errors[0])

		const coords = this.#coords(hash)
		const lat = dichotomy(-90, 90, coords.lat)
		const long = dichotomy(-180, 180, coords.long)
		const neighbors = [
			[lat.value - lat.interval, long.value - long.interval],
			[lat.value - lat.interval, long.value],
			[lat.value - lat.interval, long.value + long.interval],

			[lat.value, long.value - long.interval],
			[lat.value, long.value + long.interval],

			[lat.value + lat.interval, long.value - long.interval],
			[lat.value + lat.interval, long.value],
			[lat.value + lat.interval, long.value + long.interval],
		].map(([lat, long]) => {
			return Geohash.encode([
				this.#wrap(lat, 90),
				this.#wrap(long, 180)
			])
		})
		return {
			bl: neighbors[0],
			bc: neighbors[1],
			br: neighbors[2],
			cl: neighbors[3],
			cr: neighbors[4],
			tl: neighbors[5],
			tc: neighbors[6],
			tr: neighbors[7],
		}
	}

	static #wrap (num: number, base: number) {
		if (num < -base) num = num + base * 2
		if (num > +base) num = num - base * 2
		return num
	}
}