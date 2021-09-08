export const isValid = (): { valid: true, error: null } => ({ valid: true, error: null })

export const isInvalid = (message: string): { valid: false, error: string } => ({ valid: false, error: message })
