import { pipe } from './base'
import { time, Timeable } from './times'
import { boolean, number, string } from './types'

export const coerceString = () => pipe<string, string, any>((input: unknown) => String(input).toString()).pipe(string())
export const coerceNumber = () => pipe<number, number, any>((input: unknown) => Number(input)).pipe(number())
export const coerceBoolean = () => pipe<boolean, boolean, any>((input: unknown) => Boolean(input)).pipe(boolean())
export const coerceTime = () => pipe<Date, Timeable, any>((input: unknown) => new Date(input as any)).pipe(time())
