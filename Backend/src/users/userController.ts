import { Request, Router, Response } from "express"

import { asyncHandler } from "../utils/AsyncHandler"
import { prisma } from "../utils/PrismaClient"
import CustomRequest from "../utils/CustomRequest"

const userRoute = Router()
//TODO  remove id from visibility
userRoute.get(
  "/profile",
  asyncHandler(async (req: Request, res: Response) => {
    console.log("Profile route hit")
    console.log("User:", req.user?.role)
    console.log(req.user?.id)

    const id: number = req.user.id
    const user = await prisma.users.findUnique({
      where: { id: id },
      select: {
        id: true,
        email: true,
        phoneNumber: true,
      },
    })
    res.status(200).json({ user: user })
  })
)

export default userRoute
