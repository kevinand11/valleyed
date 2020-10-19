export type Rule = (value: any) => { valid: boolean, error: string | undefined }

export class Validator {
	public static single(value: any, rules: Rule[], presence = true){
		if(value === undefined && presence === false) return { isValid: true, errors: [] }

		if(rules.length === 0) return { isValid: true, errors: [] }

		const checks = rules.map((rule) => rule(value))
		const isValid = checks.every((r) => r.valid)
		const errors = checks.map((r) => r.error)
			.filter((e) => e !== undefined) as string[]
		return { isValid, errors }
	}
}
