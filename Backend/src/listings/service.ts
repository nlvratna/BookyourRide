import { Car, CarType, Image } from "@prisma/client"
import { StatusCodes } from "http-status-codes"
import { HttpException } from "../exception/HttpException"
import { prisma } from "../utils/PrismaClient"
import { CarModel, carValidation } from "./model"
import { globalValidator } from "../utils/GlobalValidator"

import { deleteObject, getImageUrl } from "./images/service"

const checkOwner = async (userId: number) => {
  const owner = await prisma.owner.findFirst({ where: { userId: userId }, include: { car: true } })

  if (!owner) {
    throw new HttpException(StatusCodes.BAD_GATEWAY, "Owner details not found")
  }
  return owner
}

const carMapper = (car: Car, imageUrl: any): CarModel => {
  return {
    // I should send the carId
    name: car.name,
    brand: car.brand,
    imageUrl: imageUrl,
    type: car.type,
    isBooked: car.isBooked,
    price: car.pricePerDay,
  }
}

const getUrls = async (images: Image[]): Promise<string[]> => {
  // Use Promise.all to handle multiple async calls
  const urls = await Promise.all(
    images.map(async (image) => {
      return await getImageUrl(image.imageName)
    })
  )

  return urls
}

export const addListing = async (id: number, carDetails: Car): Promise<CarModel | null> => {
  //  Independent promises can be done this way
  const [validDetails, owner] = await Promise.all([
    globalValidator(carValidation, carDetails) as Promise<CarModel>,
    checkOwner(id),
  ])
  const { name, brand, price } = validDetails

  const car = await prisma.car.create({
    data: {
      name,
      brand,
      type: carDetails.type ?? CarType.FiveSeater,
      owner: { connect: { id: owner.id } },
      pricePerDay: price,
    },
    include: { images: true },
  })

  const imageUrls = await getUrls(car.images)

  const listedCar = carMapper(car, imageUrls)

  return listedCar
}

export const updateListing = async (userId: number, carId: string, carDetails: Car): Promise<CarModel | null> => {
  const owner = await checkOwner(userId)
  console.log(carId)
  // should also if the car belongs to the owner or nor before proceeding

  if (!owner.car.find((car) => car.id === carId)) {
    // I don't know if this check is important cause client will send the carId of their car in general when they look ath the cars
    throw new HttpException(StatusCodes.FORBIDDEN, "Invalid Car Owner")
  }
  const car = await prisma.car.update({
    where: { id: carId, ownerId: owner.id },
    data: carDetails,
    include: {
      images: true,
    },
  })
  const url = await getUrls(car.images)

  return carMapper(car, url)
}

export const deleteListing = async (userId: number, carId: string) => {
  const owner = await checkOwner(userId)

  if (!owner.car.find((car) => car.id === carId)) {
    // I don't know if this check is important cause client will send the carId of their car in general when they look at the cars
    throw new HttpException(StatusCodes.FORBIDDEN, "Invalid Car Owner")
  }
  await deleteObject(`${owner.id}/${carId}`)
  await prisma.car.delete({ where: { id: carId, ownerId: owner.id } })
}
