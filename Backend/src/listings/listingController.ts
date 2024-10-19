import { Router, Request, Response } from "express"
import { asyncHandler } from "../utils/AsyncHandler"
import CustomRequest from "../utils/CustomRequest"
import { addListing, deleteListing, updateListing } from "./listingService"
import { HttpException } from "../exception/HttpException"
import { StatusCodes } from "http-status-codes"

const listingRoute = Router()

listingRoute.post(
  "/add_car",
  asyncHandler(async (req: CustomRequest, res: Response) => {
    const ownerDetailsId = req.user?.id
    const car = await addListing(ownerDetailsId, req.body)
    res.status(200).send(car)
  })
)

listingRoute.patch(
  "/:carId/update_car",
  asyncHandler(async (req: CustomRequest, res: Response) => {
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
  asyncHandler(async (req: CustomRequest, res: Response) => {
    const userId = req.user?.id
    const carID: string = req.params?.carId

    await deleteListing(userId, carID)

    res.status(204).json({ message: "Deleted successfully" })
  })
)

export default listingRoute
