import { makePipeFn, PipeError } from './base'
import * as fns from '../utils/functions'
import { emailRegex, urlRegex } from '../utils/regexes'

export const has = (length: number, stripHTMLTags = false, err = `must contain ${length} characters`) =>
	makePipeFn<string>((input) => {
		if ((stripHTMLTags ? fns.stripHTML(input) : input).trim().length === length) return input
		throw new PipeError([err], input)
	})

export const min = (length: number, stripHTMLTags = false, err = `must contain ${length} or more characters`) =>
	makePipeFn<string>((input) => {
		if ((stripHTMLTags ? fns.stripHTML(input) : input).trim().length >= length) return input
		throw new PipeError([err], input)
	})

export const max = (length: number, stripHTMLTags = false, err = `must contain ${length} or less characters`) =>
	makePipeFn<string>((input) => {
		if ((stripHTMLTags ? fns.stripHTML(input) : input).trim().length <= length) return input
		throw new PipeError([err], input)
	})

export const email = (err = 'is not a valid email') =>
	makePipeFn<string>((input) => {
		if (emailRegex.test(input)) return input
		throw new PipeError([err], input)
	})

export const url = (err = 'is not a valid url') =>
	makePipeFn<string>((input) => {
		if (urlRegex().test(input)) return input
		throw new PipeError([err], input)
	})

export const trim = () => makePipeFn<string>((input) => input.trim())

export const lower = () => makePipeFn<string>((input) => input.toLowerCase())

export const upper = () => makePipeFn<string>((input) => input.toUpperCase())

export const capitalize = () => makePipeFn<string>((input) => fns.capitalize(input))

export const stripHTML = () => makePipeFn<string>((input) => fns.stripHTML(input))

export const slice = (length: number) => makePipeFn<string>((input) => fns.trimToLength(input, length))
