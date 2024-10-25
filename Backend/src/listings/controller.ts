import { Router, Request, Response } from "express"
import { asyncHandler } from "../utils/AsyncHandler"
import { addListing, deleteListing, updateListing } from "./service"
import { HttpException } from "../exception/HttpException"
import { StatusCodes } from "http-status-codes"

import { Car } from "@prisma/client"
import { CustomParams } from "../utils/Params"

const listingRoute = Router()

listingRoute.post(
  "/add_car",
  asyncHandler(async (req: Request<{}, {}, Car>, res: Response) => {
    const ownerDetailsId = req.user?.id

    const car = await addListing(ownerDetailsId, req.body)
    res.status(200).send(car)
  })
)

listingRoute.patch(
  "/:carId/update_car",
  asyncHandler(async (req: Request<CustomParams, {}, Car>, res: Response) => {
    const ownerDetailsId = req.user?.id
    const carId: string = req.params?.carId
    if (!carId) {
      throw new HttpException(StatusCodes.BAD_REQUEST, `Missing parameter carId`)
    }
    console.log(req.body)

    const car = await updateListing(ownerDetailsId, carId, req.body)

    res.status(200).send(car)
  })
)

listingRoute.delete(
  "/:carId/delete_car",
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id
    const carId: string = req.params?.carId

    await deleteListing(userId, carId)

    res.status(204).json({ message: "Deleted successfully" })
  })
)

export default listingRoute
