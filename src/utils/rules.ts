export type Valid = {
	valid: true,
	error: undefined
}

export type Invalid = {
	valid: false,
	error: string
}

export const isValid = () => ({ valid: true, error: undefined })

export const isInvalid = (message: string) => ({ valid: false, error: message })
