import urlRegex from 'url-regex-safe'
import { normalizeUrl } from './normalize'

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
	const returnValue = new Set()
	const urls = text.match(urlRegex()) || []
	urls.forEach((url) => {
		returnValue.add(normalizeUrl(url.trim().replace(/\.+$/, '')))
	})

	return Array.from(returnValue)
}
