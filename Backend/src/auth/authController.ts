import { Request, Response, Router } from "express"
import { StatusCodes } from "http-status-codes"
import { HttpException } from "../exception/HttpException"
import { asyncHandler } from "../utils/AsyncHandler"
import CustomRequest from "../utils/CustomRequest"
import { verifyJwt } from "./authMiddleware"
import { login, signUp } from "./authService"
import { generateAccessToken, newAccessToken } from "./jwtToken"

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

authRoute.get(
  "/accessToken",
  verifyJwt,
  asyncHandler(async (req: CustomRequest, res: Response) => {
    const id: number = req.user?.id
    if (!id)
      throw new HttpException(StatusCodes.UNAUTHORIZED, "User id not found")

    const cookie = req.cookies

    if (!cookie?.refreshtoken) {
      throw new HttpException(
        StatusCodes.UNAUTHORIZED,
        "Refresh token is not available in cookies"
      )
    }
    const refreshToken = cookie.refreshtoken
    const accessToken = await newAccessToken(id, refreshToken)

    res.status(200).json({ accessToken: accessToken })
  })
)

export default authRoute
