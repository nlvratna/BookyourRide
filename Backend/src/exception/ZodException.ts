import { ZodError, ZodErrorMap, ZodIssue } from "zod"
import { HttpException } from "./HttpException"

export class ZodException extends Error {
  issues: ZodError
  status: number
  constructor(status: number, issues: ZodError) {
    super()
    this.status = status
    this.issues = issues
  }
}
