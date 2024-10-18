import { Router, Request, Response } from "express"
import { asyncHandler } from "../utils/AsyncHandler"
import CustomRequest from "../utils/CustomRequest"
import { addListing } from "./listingService"

const listingRoute = Router()

listingRoute.post(
  "/add_car",
  asyncHandler(async (req: CustomRequest, res: Response) => {
    const ownerDetailsId = req.user?.id
    const car = await addListing(ownerDetailsId, req.body)
    res.status(200).send(car)
  })
)
