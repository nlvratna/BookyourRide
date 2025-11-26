import { Request, Router, Response } from "express"

import { asyncHandler } from "../utils/AsyncHandler"

import { changeDetails, deleteAccount, getProfile } from "./service"
import { Profile } from "./model"
import { Owner, Users } from "@prisma/client"
import { HttpException } from "../exception/HttpException"
import { StatusCodes } from "http-status-codes"
import { log } from "console"

const userRoute = Router()

userRoute.get(
  "/profile",
  asyncHandler(async (req: Request, res: Response) => {
    const id: number = req.user.id

    const user = await getProfile(id)

    res.status(200).json({ user: user })
  })
)

userRoute.patch(
  "/update_details",
  asyncHandler(async (req: Request, res: Response) => {
    const id: number = req.user?.id
    const password: string = req.body.password

    if (password === null) {
      throw new HttpException(StatusCodes.FORBIDDEN, "Password is required")
    }

    const userProfile = await changeDetails(id, req.body)
    res.status(200).send(userProfile)
  })
)

userRoute.delete(
  "/delete_account",
  asyncHandler(async (req: Request, res: Response) => {
    const id: number = req.user?.id
    const password: string = req.body.password

    if (password === null) {
      throw new HttpException(StatusCodes.FORBIDDEN, "Password is required")
    }
    await deleteAccount(id, password)

    res.status(204).json({ message: "Account deleted successfully" })
  })
)

export default userRoute
