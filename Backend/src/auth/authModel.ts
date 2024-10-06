import { body } from "express-validator"
import { z } from "zod"

export interface UserModel {
  userName: string
  email: string
  password: string
  phoneNumber: string
}

export const userValidationZod = z.object({
  userName: z.string().trim(),
  email: z.string().email(),
  password: z
    .string()
    .min(8, "Minimum 8 characters are required for a password"),
  phoneNumber: z.string().length(10),
})

export const userValidation = [
  body("userName")
    .isString()
    .notEmpty()
    .withMessage("UserName cannot be empty"),
  body("email")
    .isEmail()
    .withMessage("Invalid Email Body")
    .notEmpty()
    .withMessage("Email is required"),
  body("password")
    .notEmpty()
    .withMessage("password cannot be empty")
    .isAlphanumeric()
    .withMessage("Password should include numbers and Characters")
    .isLength({ min: 8 })
    .withMessage("Password should at least contain 8 character"),
  body("phoneNumber")
    .isMobilePhone("en-IN")
    .withMessage("Invalid phoneNumber")
    .notEmpty()
    .withMessage("phone number is required"),
]

export interface LoginForm {
  email: string
  password: string
}
