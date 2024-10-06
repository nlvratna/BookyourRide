import { Router, Request, Response } from "express"
import { login, signUp } from "./authService"
import { asyncHandler } from "../utils/AsyncHandler"
import { generateAccessToken } from "./jwtToken"
import { Users } from "@prisma/client"
import { HttpException } from "../exception/HttpException"
import { StatusCodes } from "http-status-codes"

const authRoute = Router()

authRoute.post(
  "/signup",

  asyncHandler(async (req: Request, res: Response) => {
    const user = await signUp(req.body)
    const token: string = generateAccessToken(user)
    res
      .cookie("refreshtoken", user.refreshToken, {
        httpOnly: true,
        sameSite: "strict",
      })
      .status(201)
      .json({ token: token })
  })
)

authRoute.post(
  "/login",
  asyncHandler(async (req: Request, res: Response) => {
    const user = await login(req.body)
    // if (user === null)  this might become handy
    //   throw new HttpException(
    //     StatusCodes.INTERNAL_SERVER_ERROR,
    //     "Something Went Wrong"
    //   )
    const token: string = generateAccessToken(user)
    res
      .cookie("refreshtoken", user.refreshToken, {
        httpOnly: true,
        sameSite: "strict",
      })
      .status(200)
      .json({ accessToken: token })
  })
)

export default authRoute
