export const isValid = (): { valid: true, error: undefined } => ({ valid: true, error: undefined })

export const isInvalid = (message: string): { valid: false, error: string } => ({ valid: false, error: message })
