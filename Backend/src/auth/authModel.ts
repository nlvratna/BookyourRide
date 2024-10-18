import { z, ZodFunction, ZodObject, ZodSchema } from "zod"
import { ZodException } from "../exception/ZodException"
import { StatusCodes } from "http-status-codes"

// export interface UserModel {
//   userName: string
//   email: string
//   password: string
//   phoneNumber: string
// }

export const userValidationZod = z.object({
  userName: z.string().trim(),
  email: z.string({ invalid_type_error: "Expected an email " }).email("Invalid email body"),
  password: z.string({ required_error: "password is required" }).min(8, "Minimum 8 characters are required for a password"),
  phoneNumber: z.string({ message: "phone number is required" }).length(10),
})

// export interface LoginForm {
//   email: string
//   password: string
// }
export const loginValidation = z.object({
  email: z.string({ invalid_type_error: "Expected an email " }).email("Invalid email body"),
  password: z.string({ required_error: "password is required" }),
})

export const ownerValidation = z.object({
  user: userValidationZod.optional(),
  location: z.string({ message: "location is required" }).trim(),
  shopName: z.string({ message: "shop name is required" }).trim(),
})

export type UserModel = z.infer<typeof userValidationZod>
export type OwnerModel = z.infer<typeof ownerValidation>
export type LoginForm = z.infer<typeof loginValidation>
