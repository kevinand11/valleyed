export const isValid = (): { valid: true, error: null } => ({ valid: true, error: null })

export const isInvalid = (error: string): { valid: false, error: string } => ({ valid: false, error })
