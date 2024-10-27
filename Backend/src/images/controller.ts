import { Request, Response, Router } from "express"
import multer, { memoryStorage } from "multer"
import { asyncHandler } from "../utils/AsyncHandler"
import { addImage, deleteImage, getImages } from "./service"
import { Image } from "@prisma/client"
import { HttpException } from "../exception/HttpException"
import { StatusCodes } from "http-status-codes"
import { CustomParams } from "../utils/Params"
import { ImageModel } from "./model"

const imageRoute = Router()

interface Query {
  fileName: string
}

const storage = memoryStorage()

const upload = multer({ storage })

// sharp - to change stuff on the image

//TODO Testing for these routes

imageRoute.post(
  "/:carId/add_image",
  upload.single("image"),
  asyncHandler(async (req: Request<CustomParams, {}, ImageModel>, res: Response) => {
    const carId: string = req.params?.carId
    if (!carId || !req.file) {
      throw new HttpException(StatusCodes.BAD_REQUEST, `Missing a required parameter`)
    }
    const image = await addImage(carId, req.file)
    console.log(image)

    res.status(200).send(image)
  })
)
imageRoute.get(
  "/:carId/images",
  asyncHandler(async (req: Request<CustomParams>, res: Response) => {
    const images = await getImages(req.params?.carId)
    res.status(200).send(images)
  })
)

imageRoute.delete(
  "/:carId/delete_image/:id",
  asyncHandler(async (req: Request<CustomParams>, res: Response) => {
    const carId: string = req.params?.carId
    const imageId: number = req.params?.id

    await deleteImage(carId, imageId)

    res.status(204).json({ message: "Deleted successfully" })
  })
)

export default imageRoute
