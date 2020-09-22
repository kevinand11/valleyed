export const capitalizeText = (text: string) => `${text[0].toUpperCase()}${text.slice(1).toLowerCase()}`

export const extractTextFromHTML = (html: string) => html?.trim().replace(/<[^>]+>/g, '') ?? ''

export const trimToLength = (body: string, length: number) => {
	if(body.length < length){ return body }
	const index = body.indexOf(' ', length)
	return `${body.slice(0, index)}...`
}
