import { Router, Request, Response } from "express"
import { asyncHandler } from "../../utils/AsyncHandler"
import { getListings, updateLocation } from "./service"
import { Car } from "@prisma/client"
import { readFile } from "fs"
import { randomBytes } from "crypto"

const ownerRoute = Router()

ownerRoute.get(
  "/get_cars",
  asyncHandler(async (req: Request, res: Response) => {
    const userId: number = req.user?.id

    const cars: Car[] = await getListings(userId)

    res.status(200).send(cars)
  })
)
ownerRoute.patch(
  "/update",
  asyncHandler(async (req: Request, res: Response) => {
    const updatedDetails = await updateLocation(req.user?.id, req.body)
    res.status(200).send(updatedDetails)
  })
)
export default ownerRoute
