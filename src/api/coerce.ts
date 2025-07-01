import { standard } from './base/pipes'
import { time } from './times'
import { boolean, number, string } from './types'

export const coerceString = () => standard<string, string>(({ input }) => `String(${input}).toString()`, {}).pipe(string())
export const coerceNumber = () => standard<number, number>(({ input }) => `Number(${input})`, {}).pipe(number())
export const coerceBoolean = () => standard<boolean, boolean>(({ input }) => `Boolean(${input})`, {}).pipe(boolean())
export const coerceTime = () => standard<Date, Date>(({ input }) => `new Date(${input})`, {}).pipe(time() as any)
