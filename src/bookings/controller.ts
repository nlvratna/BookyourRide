import { Router, Request, Response } from "express"
import { asyncHandler } from "../utils/AsyncHandler"
import { bookCar, getCars } from "./service"
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

bookingRoute.post(
  "/:carId/book",
  asyncHandler(async (req: Request, res: Response) => {
    const carId = req.params?.carId
    const { startDate, endDate } = req.body
    const userId = req.user?.id

    if (!carId || !userId) {
      // add this later || !startDate || !endDate
      throw new HttpException(StatusCodes.BAD_REQUEST, "Missing required parameters")
    }
    const booking = await bookCar(carId, userId, new Date(), new Date(Date.now() + 2 * 60 * 60 * 24 * 1000))

    res.status(200).json({ BookingDetails: booking })
  })
)

export default bookingRoute
