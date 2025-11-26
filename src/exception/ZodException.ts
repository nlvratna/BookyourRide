import { ZodError, ZodErrorMap, ZodIssue } from "zod"

export class ZodException extends Error {
  issues: ZodError
  status: number
  constructor(status: number, issues: ZodError) {
    super()
    this.status = status
    this.issues = issues
  }
}
