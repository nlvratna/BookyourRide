import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
  ListObjectsCommand,
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

import { Car, Image } from "@prisma/client"
import { prisma } from "../../utils/PrismaClient"

import { HttpException } from "../../exception/HttpException"
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
// the functions in this might change
const s3Client = new S3Client({
  region: bucketRegion,
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretKey,
  },
})

export const getImageUrl = async (fileName: string): Promise<string | null> => {
  const params = {
    Bucket: bucketName,
    Key: fileName,
  }
  const downloadCommand = new GetObjectCommand(params)
  const url = await getSignedUrl(s3Client, downloadCommand, {
    expiresIn: 3600,
  })
  return url
}

export const addImage = async (carId: string, file: ImageModel) => {
  const car = await checkCar(carId)

  const imageName = `${car.ownerId}/${car.id}/${file.fileName}`

  const params = {
    Bucket: bucketName,
    Key: imageName,
    ContentType: "image/jpeg",
    Metadata: {
      "Content-Type": "image/jpeg",
    },
  }
  console.log(params)

  const command = new PutObjectCommand(params)
  const imageUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })

  const image = await prisma.image.create({
    data: {
      imageName: imageName,
      car: { connect: { id: carId } },
    },
  })
  console.log(image)
  return imageUrl
}

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

export const deleteImage = async (carId: string, imageId: number) => {
  const car = await checkCar(carId)
  const image = car.images.find((image) => image.id === imageId)
  if (!image) {
    throw new HttpException(StatusCodes.NOT_FOUND, "Image is not found")
  }
  await deleteObject(image.imageName)

  await prisma.image.delete({ where: { id: imageId } })
}
