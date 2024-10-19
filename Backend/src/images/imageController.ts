import { Request, Response, Router } from "express"
import multer from "multer"
import { asyncHandler } from "../utils/AsyncHandler"
import { addImage, deleteImage, editImage } from "./imageService"
import { Image } from "@prisma/client"
import { HttpException } from "../exception/HttpException"
import { StatusCodes } from "http-status-codes"

const imageRoute = Router()

const storage = multer.memoryStorage() // disk storage could be good
const upload = multer({ storage })

// sharp - to change stuff on the image

//TODO Testing for these routes

imageRoute.post(
  "/:carId/add_images",
  upload.array("images", 6),
  asyncHandler(async (req: Request, res: Response) => {
    const carId: string = req.params?.carId
    if (!carId) {
      throw new HttpException(StatusCodes.BAD_REQUEST, `Missing parameter carId`)
    }
    const files = req.files as Express.Multer.File[]
    const image: Image[] = await addImage(carId, files)

    res.status(200).send(image)
  })
)

imageRoute.put(
  "/:carId/change_image/:id",
  upload.single("image"),
  asyncHandler(async (req: Request, res: Response) => {
    const carId: string = req.params?.carId
    const imageId: number = parseInt(req.params?.id, 10)

    if (!carId || !imageId) {
      throw new HttpException(StatusCodes.BAD_REQUEST, `Missing parameter carId`)
    }

    const newImage = await editImage(carId, imageId, req.file)

    res.status(200).send(newImage)
  })
)

imageRoute.delete(
  "/:carId/delete_image/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const carId: string = req.params?.carId
    const imageId: number = parseInt(req.params?.id, 10)

    await deleteImage(carId, imageId)

    res.status(204).json({ message: "Deleted successfully" })
  })
)
