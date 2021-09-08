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
	return `${ body.slice(0, indexToTrim) }...`
}
