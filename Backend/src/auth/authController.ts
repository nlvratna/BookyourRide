import { Router, Request, Response, NextFunction } from "express"
import { login, signUp } from "./authService"
import { asyncHandler } from "../utils/AsyncHandler"
import { userValidation } from "./authModel"
import { validationResult } from "express-validator"
import { HttpException } from "../exception/HttpException"
import { StatusCodes } from "http-status-codes"

const authRoute: Router = Router()

authRoute.post(
  "/signup",

  asyncHandler(async (req: Request, res: Response) => {
    const user = await signUp(req.body)
    res.status(200).json(user)
  })
)

authRoute.post(
  "/login",
  asyncHandler(async (req: Request, res: Response) => {
    const user = await login(req.body)
    res.status(200).json({ user })
  })
)

export default authRoute
