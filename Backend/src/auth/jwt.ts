import { Users } from "@prisma/client"

import * as jwt from "jsonwebtoken"
import { UserModel } from "./model"

import { HttpException } from "../exception/HttpException"
import { StatusCodes } from "http-status-codes"
import { log } from "console"
import { prisma } from "../utils/PrismaClient"

export const generateAccessToken = (user: Users) => {
  const accessToken = jwt.sign(
    {
      userInfo: {
        id: user.id,
        username: user.email,
        role: user.role,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "5min" }
  )

  return accessToken
}

export const generateRefreshToken = function (user: UserModel) {
  const refreshToken = jwt.sign(
    {
      userInfo: {
        username: user.email,
      },
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "1d" }
  )
  return refreshToken
}

export const newAccessToken = async (id: number, refreshToken: string): Promise<string | null> => {
  try {
    const user = await prisma.users.findFirst({ where: { id } })
    if (!user) {
      throw new HttpException(StatusCodes.NOT_FOUND, "User not found")
    }
    if (refreshToken !== user.refreshToken) {
      throw new HttpException(StatusCodes.FORBIDDEN, "Invalid Refresh Token")
    }
    jwt.verify(user.refreshToken, process.env.REFRESH_TOKEN_SECRET)
    const grantedAccessToken = generateAccessToken(user)
    return grantedAccessToken
  } catch (error) {
    console.error(error)
    return error
  }
}
