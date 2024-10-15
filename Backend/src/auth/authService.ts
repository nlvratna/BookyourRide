import { Owner, Role, Users } from "@prisma/client"
import { compare, hashSync } from "bcrypt"
import { StatusCodes } from "http-status-codes"
import { HttpException } from "../exception/HttpException"
import { prisma } from "../utils/prismaClient"
import {
  LoginForm,
  loginValidation,
  OwnerModel,
  ownerValidation,
  UserModel,
  userValidationZod,
} from "./authModel"
import { generateRefreshToken } from "./jwtToken"

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

export const userValidation = (user: UserModel) => {
  const verifiedUser = userValidationZod.safeParse(user)
  if (!verifiedUser.success) {
    throw new HttpException(
      StatusCodes.UNPROCESSABLE_ENTITY,
      verifiedUser.error?.errors.map((e) => e.message).join(" ")
    )
  }
  return verifiedUser
}

export const signUp = async (user: UserModel): Promise<Users | null> => {
  // const { userName, email, password, phoneNumber } = user
  const validDetails = userValidation(user)
  const { userName, email, password, phoneNumber } = validDetails.data
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
  const verifiedData = loginValidation.safeParse(loginForm)
  if (!verifiedData.success) {
    throw new HttpException(
      StatusCodes.UNPROCESSABLE_ENTITY,
      verifiedData.error?.errors.map((e) => e.message).join(" ")
    )
  }
  const { email, password } = verifiedData.data
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
export const registerOwner = async function (
  owner: OwnerModel
): Promise<Owner | null> {
  console.log(owner)

  const { email, password } = owner.user
  const userDetails = await prisma.users.findUnique({ where: { email } })
  if (!userDetails) {
    // if the user is not already registered
    const verifiedUser = ownerValidation.safeParse(owner)
    if (!verifiedUser.success) {
      throw new HttpException(
        StatusCodes.UNPROCESSABLE_ENTITY,
        verifiedUser.error.errors.map((e) => e.message).join(" ")
      )
    }
    const { user, location, shopName } = verifiedUser.data
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
