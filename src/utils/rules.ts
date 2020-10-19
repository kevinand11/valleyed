export const isValid = () => ({ valid: true, error: undefined })

export const isInvalid = (message: string) => ({ valid: false, error: message })
