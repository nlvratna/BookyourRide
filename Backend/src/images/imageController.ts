import { Request, Response, Router } from "express"
import multer from "multer"
import { asyncHandler } from "../utils/AsyncHandler"
import { addImage } from "./imageService"
import { Image } from "@prisma/client"

const imageRoute = Router()

const storage = multer.memoryStorage() // disk storage could be good
const upload = multer({ storage })

// sharp - to change stuff on the image

imageRoute.post(
  "/:carId/add_images",
  upload.array("images", 6),
  asyncHandler(async (req: Request, res: Response) => {
    const carId: string = req.params.carId
    const files = req.files as Express.Multer.File[]
    const image: Image[] = await addImage(carId, files)
    res.status(200).send(image)
  })
)
