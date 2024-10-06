import { Users } from "@prisma/client"
import { LoginForm, UserModel, userValidationZod } from "./authModel"
import { validationResult } from "express-validator"
import { StatusCodes } from "http-status-codes"
import { HttpException } from "../exception/HttpException"
import { compare, compareSync, hash, hashSync } from "bcrypt"
import { generateRefreshToken } from "./jwtToken"
import { prisma } from "../utils/prismaClient"

/*const prisma = new PrismaClient().$extends({
  query: {
    Users: {
      create({ args, query }) {
        args.data = userValidation.parse(args.data)
        return query(args)
      },
    },
  },
})*/

export const userAlreadyExists = async (email: string) => {
  const user = await prisma.users.findUnique({
    where: { email: email },
  })
  if (user) {
    throw new HttpException(StatusCodes.CONFLICT, "Email already taken")
  }
}

export const userValidation = async (user: UserModel) => {
  const verifiedUser = userValidationZod.safeParse(user)
  if (!verifiedUser.success) {
    throw new HttpException(
      StatusCodes.UNPROCESSABLE_ENTITY,
      verifiedUser.error?.errors.map((e) => e.message).join(" ")
    )
  }
  return verifiedUser
}

export const signUp = async (user: UserModel) => {
  // const { userName, email, password, phoneNumber } = user
  const validDetails = await userValidation(user)
  const { userName, email, password, phoneNumber } = validDetails.data
  await userAlreadyExists(email)
  const refreshToken = await generateRefreshToken(user)
  const registerUser = await prisma.users.create({
    data: {
      userName,
      email,
      password: hashSync(password, 12),
      phoneNumber,
      refreshToken: refreshToken,
    },
  })
  return registerUser
}

export const login = async (loginForm: LoginForm): Promise<Users | null> => {
  const { email, password } = loginForm
  // const pass = loginForm.password
  const user: Users = await prisma.users.findUnique({ where: { email } })
  if (!user) {
    throw new HttpException(StatusCodes.BAD_REQUEST, "User  not found")
  }
  const match: boolean = await compare(password, user.password)
  if (!match) {
    throw new HttpException(StatusCodes.BAD_REQUEST, "Incorrect password")
  }
  const loggedUser = await prisma.users.update({
    where: { email },
    data: {
      refreshToken: generateRefreshToken(user),
    },
  })
  return loggedUser
}
