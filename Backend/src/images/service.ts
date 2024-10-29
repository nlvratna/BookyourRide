import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

import { prisma } from "../utils/PrismaClient"

import { HttpException } from "../exception/HttpException"
import { StatusCodes } from "http-status-codes"
import { ImageModel } from "./model"

const bucketName = process.env.BUCKET_NAME
const bucketRegion = process.env.BUCKET_REGION
const accessKey = process.env.BUCKET_ACCESS_KEY
const secretKey = process.env.BUCKET_SECRET_ACCESS_KEY

const checkCar = async (carId: string) => {
  const car = await prisma.car.findUnique({ where: { id: carId }, include: { images: true } })
  if (!car) {
    throw new HttpException(StatusCodes.BAD_REQUEST, "Car details are still not passed or car is not available")
  }
  return car
}

const s3Client = new S3Client({
  region: bucketRegion,
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretKey,
  },
})

export const deleteObject = async (file: string) => {
  try {
    const params = {
      Bucket: bucketName,
      Key: file,
    }
    const command = new DeleteObjectCommand(params)
    await s3Client.send(command)
  } catch (error) {
    console.log(error)
    return error
  }
}

const getImageUrl = async (imageName: string): Promise<string> => {
  const params = {
    Bucket: bucketName,
    Key: imageName,
  }
  const command = new GetObjectCommand(params)
  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 })

  return url
}

export const addImage = async (carId: string, file: Express.Multer.File): Promise<ImageModel> => {
  try {
    const car = await checkCar(carId)
    const imageName = `${car.ownerId}/${car.id}/${file.originalname}`

    const params = {
      Bucket: bucketName,
      Key: imageName,
      Body: file.buffer,
      ContentType: file.mimetype,
    }
    console.log(params)

    const command = new PutObjectCommand(params)
    await s3Client.send(command)

    const image = await prisma.image.create({
      data: {
        imageName,
        car: { connect: { id: car.id } },
      },
    })
    console.log(image)

    const url = await getImageUrl(imageName)

    const imageDetails: ImageModel = {
      id: image.id,
      key: imageName,
      imageUrl: url,
    }

    return imageDetails
  } catch (error) {
    return error
  }
}

export const getImages = async (carId: string): Promise<ImageModel[]> => {
  const car = await checkCar(carId)
  const imageDetails: ImageModel[] = await Promise.all(
    car.images.map(async (image) => ({
      id: image.id,
      key: image.imageName,
      imageUrl: await getImageUrl(image.imageName),
    }))
  )

  return imageDetails
}

export const deleteImage = async (carId: string, imageId: number) => {
  const car = await checkCar(carId) // await prisma.image.findFirst({where:{carId:carId,id:id}}) better version - maybe an index in db
  const image = car.images.find((image) => image.id === imageId)
  if (!image) {
    throw new HttpException(StatusCodes.NOT_FOUND, "Image is not found")
  }
  await deleteObject(image.imageName)

  await prisma.image.delete({ where: { id: imageId } })
}
