import { isEmail } from '../../rules'

export const isEmailX = (error?: string) => (value: string) => isEmail(value, error)