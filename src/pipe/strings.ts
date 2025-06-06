import { makePipe, PipeError } from './base'
import * as fns from '../utils/functions'
import { emailRegex, urlRegex } from '../utils/regexes'

export const has = (length: number, stripHTMLTags = false, err = `must contain ${length} characters`) =>
	makePipe<string>((input) => {
		if ((stripHTMLTags ? fns.stripHTML(input) : input).trim().length === length) return input
		throw new PipeError([err], input)
	}, {})

export const min = (length: number, stripHTMLTags = false, err = `must contain ${length} or more characters`) =>
	makePipe<string>((input) => {
		if ((stripHTMLTags ? fns.stripHTML(input) : input).trim().length >= length) return input
		throw new PipeError([err], input)
	}, {})

export const max = (length: number, stripHTMLTags = false, err = `must contain ${length} or less characters`) =>
	makePipe<string>((input) => {
		if ((stripHTMLTags ? fns.stripHTML(input) : input).trim().length <= length) return input
		throw new PipeError([err], input)
	}, {})

export const email = (err = 'is not a valid email') =>
	makePipe<string>((input) => {
		if (emailRegex.test(input)) return input
		throw new PipeError([err], input)
	}, {})

export const url = (err = 'is not a valid url') =>
	makePipe<string>((input) => {
		if (urlRegex().test(input)) return input
		throw new PipeError([err], input)
	}, {})

export const asTrim = () => makePipe<string>((input) => input.trim(), {})

export const asLower = () => makePipe<string>((input) => input.toLowerCase(), {})

export const asUpper = () => makePipe<string>((input) => input.toUpperCase(), {})

export const asCapitalize = () => makePipe<string>((input) => fns.capitalize(input), {})

export const asStrippedHTML = () => makePipe<string>((input) => fns.stripHTML(input), {})

export const asSliced = (length: number) => makePipe<string>((input) => fns.trimToLength(input, length), {})
