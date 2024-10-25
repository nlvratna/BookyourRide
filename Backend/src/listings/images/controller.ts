import { Request, Response, Router } from "express"
import multer from "multer"
import { asyncHandler } from "../../utils/AsyncHandler"
import { addImage, deleteImage, getImageUrl } from "./service"
import { Image } from "@prisma/client"
import { HttpException } from "../../exception/HttpException"
import { StatusCodes } from "http-status-codes"
import { CustomParams } from "../../utils/Params"
import { ImageModel } from "./model"

const imageRoute = Router()

interface Query {
  fileName: string
}

// sharp - to change stuff on the image

//TODO Testing for these routes

imageRoute.get(
  "/:carId/add_image",
  asyncHandler(async (req: Request<CustomParams, {}, ImageModel>, res: Response) => {
    const carId: string = req.params?.carId
    if (!carId) {
      throw new HttpException(StatusCodes.BAD_REQUEST, `Missing parameter carId`)
    }
    const file: ImageModel = {
      fileName: "img.jpeg",
      contentType: "image/jpeg",
    }

    const image = await addImage(carId, file)
    console.log(image)

    res.status(200).send(image)
  })
)
imageRoute.get(
  "/image",
  asyncHandler(async (req: Request<{}, {}, {}, Query>, res: Response) => {
    const url = await getImageUrl(req.query.fileName)

    res.send(url)
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
