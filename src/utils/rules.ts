export type Rule<T> = (value: T) => ReturnType<typeof isValid> | ReturnType<typeof isInvalid>
export type Sanitizer<T = void> = (value: T) => T

export const isValid = (): { valid: true, error: null } => ({ valid: true, error: null })

export const isInvalid = (error: string): { valid: false, error: string } => ({ valid: false, error })

export const makeRule = <T> (func: Rule<T>): Rule<T> => (val: T) => func(val)