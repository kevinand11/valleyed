import { capitalizeText, extractTextFromHTML, trimToLength } from '../../src/santizers'

test('CapitalizeText', () => {
	expect(capitalizeText('test')).toBe('Test')
	expect(capitalizeText('test home')).toBe('Test Home')
	expect(capitalizeText('')).toBe('')
	expect(capitalizeText(2 as unknown as string)).toBe('2')
	expect(capitalizeText(null as unknown as string)).toBe(null)
	expect(capitalizeText(undefined as unknown as string)).toBe(undefined)
})

test('ExtractTextFromHTML', () => {
	expect(extractTextFromHTML('test')).toBe('test')
	expect(extractTextFromHTML(2 as unknown as string)).toBe('2')

	expect(extractTextFromHTML('<p>a</p>')).toBe('a')
	expect(extractTextFromHTML('<p>a<a>b</a></p>')).toBe('ab')
	expect(extractTextFromHTML('<p>a<img src="/" /></p>')).toBe('a')

	expect(extractTextFromHTML(null as unknown as string)).toBe(null)
	expect(extractTextFromHTML(undefined as unknown as string)).toBe(undefined)
})

test('TrimToLength', () => {
	expect(trimToLength('abc', 10)).toBe('abc')
	expect(trimToLength('abc', 1)).toBe('a...')

	expect(trimToLength(null as unknown as string, 1)).toBe(null)
	expect(trimToLength(undefined as unknown as string, 1)).toBe(undefined)

	const num = 123, arr = [1, 2, 3], obj = { name: 'test' }
	expect(trimToLength(num as unknown as string, 10)).toBe(num.toString())
	expect(trimToLength(arr as unknown as string, 10)).toBe(arr.toString())
	expect(trimToLength(obj as unknown as string, 20)).toBe(obj.toString())
})
