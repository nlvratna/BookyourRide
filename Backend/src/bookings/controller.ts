import { Router, Request, Response } from "express"
import { asyncHandler } from "../utils/AsyncHandler"
import { getCars } from "./service"
import { HttpException } from "../exception/HttpException"
import { StatusCodes } from "http-status-codes"

interface QueryFilter {
  location: string
}
const bookingRoute = Router()

bookingRoute.get(
  "/cars",
  asyncHandler(async (req: Request<{}, {}, {}, QueryFilter>, res: Response) => {
    console.log(req.query.location)
    console.log(req.query)
    if (!req.query.location) {
      throw new HttpException(StatusCodes.BAD_REQUEST, "Required location query not found")
    }
    const cars = await getCars(req.query.location)

    res.status(200).send(cars)
  })
)

export default bookingRoute
