import { StatusCodes } from "http-status-codes"
import { ZodException } from "../exception/ZodException"
import { ZodSchema } from "zod"

export const globalValidator = async (schema: ZodSchema, userData: any): Promise<any | null> => {
  const details = schema.safeParse(userData)
  if (!details.success) {
    throw new ZodException(StatusCodes.UNPROCESSABLE_ENTITY, details.error)
  }
  return details.data
}
