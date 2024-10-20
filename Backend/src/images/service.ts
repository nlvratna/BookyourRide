import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

import crypto from "crypto"

import { Image } from "@prisma/client"
import { prisma } from "../utils/PrismaClient"
import { Multer } from "multer"
import { HttpException } from "../exception/HttpException"
import { StatusCodes } from "http-status-codes"
import { body } from "express-validator"

const bucketName = process.env.BUCKET_NAME
const bucketRegion = process.env.BUCKET_REGION
const accessKey = process.env.BUCKET_ACCESS_KEY
const secretKey = process.env.BUCKET_SECRET_ACCESS_KEY

const generateImageName = (fileName: string) => crypto.randomBytes(16).toString("hex") + fileName

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

const uploadImage = async (params: { Bucket: string; Key: string; Body: Buffer; ContentType: string }) => {
  try {
    const imageUploadCommand = new PutObjectCommand(params)
    await s3Client.send(imageUploadCommand)
  } catch (error) {
    throw new HttpException(StatusCodes.INTERNAL_SERVER_ERROR, "Images are not uploaded to s3 bucket")
  }
}

const getImageUrl = async (fileName: string): Promise<string | null> => {
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

export const addImage = async (carId: string, file: Express.Multer.File[]): Promise<Image[] | null> => {
  let images: Image[] = [] // getting the files from multer and the type is Multer file[] type

  await checkCar(carId)

  file.forEach(async (file) => {
    // looping through each file and getting each image
    const imageName = generateImageName(file.originalname)

    const params = {
      // creating a parameter for each image and uploading to s3 bucket
      Bucket: bucketName,
      Key: imageName,
      Body: file.buffer,
      ContentType: file.mimetype,
    }

    await uploadImage(params) // uploading images to s3 bucket

    const imageUrl = await getImageUrl(imageName)
    //creating the image in db and adding to array to return it
    const image = await prisma.image.create({
      data: {
        imageName,
        imageUrl,
        carId, // TODO testing I don't know when
      },
    })
    images.push(image)
  })
  return images
}

export const editImage = async (carId: string, imageId: number, file: Express.Multer.File): Promise<Image | null> => {
  const imageName = generateImageName(file.originalname)
  const imageUrl = await getImageUrl(imageName)

  const car = await checkCar(carId)

  if (!car.images.find((image) => image.id === imageId)) {
    // should also  check if the owner is car owner or not maybe in the future
    throw new HttpException(StatusCodes.FORBIDDEN, "Images doesn't belong to the car")
  }

  const params = {
    Bucket: bucketName,
    Key: imageName,
    Body: file.buffer,
    ContentType: file.mimetype,
  }
  await uploadImage(params)
  const image = await prisma.image.update({
    where: { id: imageId },
    data: {
      imageName,
      imageUrl,
    },
  })
  return image
}

export const deleteImage = async (carId: string, imageId: number) => {
  const car = await checkCar(carId)
  const image = car.images.find((image) => image.id === imageId)
  if (!image) {
    throw new HttpException(StatusCodes.NOT_FOUND, "Image is not found")
  }
  const params = {
    Bucket: bucketName,
    Key: image.imageName,
  }

  const deleteCommand = new DeleteObjectCommand(params)

  await s3Client.send(deleteCommand)

  await prisma.image.delete({ where: { id: imageId } })
}
