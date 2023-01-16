import urlRegex from 'url-regex-safe'
import { normalizeUrl } from './normalize'
import { isNumber } from '../rules'

export const capitalizeText = (text: string) => {
	if (text === null || text === undefined) return text
	text = text.toString()
	const c = (v: string) => (v[0]?.toUpperCase() ?? '') + v.slice(1)
	return text.trim().split(' ').map(c).join(' ')
}

export const extractTextFromHTML = (html: string) => {
	if (html === null || html === undefined) return html
	return html?.toString()?.trim().replace(/<[^>]+>/g, '') ?? ''
}

export const trimToLength = (body: string, length: number) => {
	if (body === null || body === undefined) return body

	body = body.toString()
	if (body.length < length) return body

	const indexOfSpace = body.indexOf(' ', length)
	const indexToTrim = indexOfSpace === -1 ? length : indexOfSpace
	return `${body.slice(0, indexToTrim)}...`
}

export const extractUrls = (text: string) => {
	const urls = text.match(urlRegex()) || [] as string[]
	return urls.filter(((url, index) => urls.indexOf(url) === index)).map((url) => {
		url = url.trim()
		return {
			original: url,
			normalized: normalizeUrl(url.replace(/\.+$/, ''))
		}
	})
}

export const formatNumber = (num: number, dp?: number) => Intl
	.NumberFormat('en', { notation: 'compact', ...(dp ? { maximumFractionDigits: dp } : {}) })
	.format(isNumber(num).valid ? num : 0)

export const pluralize = (count: number, singular: string, plural: string) => Math.round(count) === 1 ? singular : plural

export const getRandomValue = () => Date.now() + Math.random().toString(36)

export const groupBy = <Type, Unique extends string | number> (array: Array<Type>, func: (item: Type) => Unique) => {
	return array.reduce((acc, cur) => {
		const key = func(cur)
		const index = acc.findIndex((a) => a.key === key)
		if (index === -1) acc.push({ key, values: [cur] })
		else acc[index].values.push(cur)
		return acc
	}, [] as { key: Unique, values: Type[] }[]) as { key: Unique, values: Type[] }[]
}

export const getAlphabet = (num: number) => 'abcdefghijklmnopqrstuv'.split('')[num] ?? 'a'

export const addToArray = <T> (array: T[], item: T, getKey: (a: T) => any, getComparer: (a: T) => number | string, asc = false) => {
	const existingIndex = array.findIndex((el) => getKey(el) === getKey(item))
	const index = array.findIndex((el) => asc ? getComparer(el) >= getComparer(item) : getComparer(el) <= getComparer(item))
	if (existingIndex !== -1 && existingIndex === index) {
		array.splice(existingIndex, 1, item)
		return array
	}
	if (existingIndex !== -1 && existingIndex !== index) array.splice(existingIndex, 1)
	if (index !== -1) array.splice(index, 0, item)
	else if (array.length === 0) array.push(item)
	else {
		const existingIsGreater = getComparer(array[0]) >= getComparer(item)
		if (existingIsGreater) asc ? array.unshift(item) : array.push(item)
		else asc ? array.push(item) : array.unshift(item)
	}
	return array
}

export const catchDivideByZero = (num: number, den: number) => den === 0 ? 0 : num / den

export const getPercentage = (num: number, den: number) => 100 * (catchDivideByZero(num, den) > 1 ? 1 : catchDivideByZero(num, den))

export const getRandomSample = <Type> (population: Array<Type>, n: number) => {
	const indexes = [] as number[]
	const indexesObject = {} as Record<number, boolean>

	while (indexes.length < n) {
		const random = Math.floor(Math.random() * population.length)
		if (random in indexesObject) continue
		indexesObject[random] = true
		indexes.push(random)
	}

	return indexes.map((idx) => population[idx])
}

export const shuffleArray = <Type> (array: Array<Type>) => [...array].sort(() => Math.random() - 0.5)