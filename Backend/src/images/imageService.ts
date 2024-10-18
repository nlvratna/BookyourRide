import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

import crypto from "crypto"

import { Image } from "@prisma/client"
import { prisma } from "../utils/PrismaClient"
import { Multer } from "multer"

const bucketName = process.env.BUCKET_NAME
const bucketRegion = process.env.BUCKET_REGION
const accessKey = process.env.BUCKET_ACCESS_KEY
const secretKey = process.env.BUCKET_SECRET_ACCESS_KEY

const imageFileName = () => crypto.randomBytes(16).toString("hex")

const s3Client = new S3Client({
  region: bucketRegion,
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretKey,
  },
})

//TODO error handling
export const addImage = async (carId: string, file: Express.Multer.File[]): Promise<Image[] | null> => {
  let images: Image[] = [] // getting the files from multer and the type is MUlter file[] type
  file.forEach(async (file) => {
    // looping through each file and getting each image
    const imageName = file.originalname + imageFileName()

    const params = {
      // creating a parameter for each image and uploading to s3 bucket
      Bucket: bucketName,
      Key: imageName,
      Body: file.buffer,
      ContentType: file.mimetype,
    }

    const imageUploadCommand = new PutObjectCommand(params)

    await s3Client.send(imageUploadCommand)

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
