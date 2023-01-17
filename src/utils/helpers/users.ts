import { isEmail, isUrl } from '../../rules'

export const isEmailX = (error?: string) => (value: string) => isEmail(value, error)
export const isUrlX = (error?: string) => (value: string) => isUrl(value, error)