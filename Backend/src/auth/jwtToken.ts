import { Users } from "@prisma/client"

import * as jwt from "jsonwebtoken"
import { UserModel } from "./authModel"

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
