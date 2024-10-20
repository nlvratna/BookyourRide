import { Router, Request, Response } from "express"
import { asyncHandler } from "../../utils/AsyncHandler"
import { getListings } from "./service"
import { Car } from "@prisma/client"

const ownerRoute = Router()

ownerRoute.get(
  "/get_cars",
  asyncHandler(async (req: Request, res: Response) => {
    const userId: number = req.user?.id

    const cars: Car[] = await getListings(userId)

    res.status(200).send(cars)
  })
)

export default ownerRoute
