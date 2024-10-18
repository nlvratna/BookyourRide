import { compare, hashSync } from "bcrypt"
import { StatusCodes } from "http-status-codes"

import { Owner, Role, Users } from "@prisma/client"

import { HttpException } from "../exception/HttpException"
import { prisma } from "../utils/PrismaClient"
import { LoginForm, loginValidation, OwnerModel, ownerValidation, UserModel, userValidationZod } from "./authModel"
import { generateRefreshToken } from "./jwtToken"
import { globalValidator } from "../utils/GlobalValidator"

export const userAlreadyExists = async (email: string) => {
  const user = await prisma.users.findUnique({
    where: { email: email },
  })
  if (user) {
    throw new HttpException(StatusCodes.CONFLICT, "Email already taken")
  }
}

export const signUp = async (user: UserModel): Promise<Users | null> => {
  const validDetails = (await globalValidator(userValidationZod, user)) as UserModel
  const { userName, email, password, phoneNumber } = validDetails

  await userAlreadyExists(email)
  const refreshToken = generateRefreshToken(user)
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
  const userDetails = (await globalValidator(loginValidation, loginForm)) as LoginForm

  const user: Users = await prisma.users.findUnique({ where: { email: userDetails.email } })
  if (!user) {
    throw new HttpException(StatusCodes.BAD_REQUEST, "User  not found")
  }
  const match: boolean = await compare(userDetails.password, user.password)
  if (!match) {
    throw new HttpException(StatusCodes.BAD_REQUEST, "Incorrect password")
  }
  const loggedUser = await prisma.users.update({
    // giving a new refresh toke for every  time user logs in
    where: { email: userDetails.email },
    data: {
      refreshToken: generateRefreshToken(user),
    },
  })
  return loggedUser
}
export const registerOwner = async function (owner: OwnerModel): Promise<Owner | null> {
  console.log(owner)

  const { email, password } = owner.user
  const userDetails = await prisma.users.findUnique({ where: { email } })
  if (!userDetails) {
    // if the user is not already registered
    const verifiedUser = (await globalValidator(ownerValidation, owner)) as OwnerModel
    const { user, location, shopName } = verifiedUser
    const registerUser = await signUp(user)
    await prisma.users.update({
      where: { email: user.email },
      data: { role: Role.RENTAL_OWNER },
    })

    const registeredOwner = await prisma.owner.create({
      data: {
        location,
        shopName,
        details: { connect: { id: registerUser.id } },
      },
    })
    return registeredOwner
  } else {
    const loggedUser = await login({ email, password })
    await prisma.users.update({
      where: { email: loggedUser.email },
      data: { role: Role.RENTAL_OWNER },
    })
    const registerOwner = await prisma.owner.create({
      data: {
        location: owner.location,
        shopName: owner.shopName,
        details: { connect: { id: loggedUser.id } },
      },
    })
    return registerOwner
  }
}
