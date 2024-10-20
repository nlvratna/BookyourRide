import { Car, CarType, Image } from "@prisma/client"
import { StatusCodes } from "http-status-codes"
import { HttpException } from "../exception/HttpException"
import { prisma } from "../utils/PrismaClient"
import { CarModel, carValidation } from "./model"
import { globalValidator } from "../utils/GlobalValidator"
import { log } from "console"

const checkOwner = async (userId: number) => {
  const owner = await prisma.owner.findFirst({ where: { userId: userId }, include: { car: true } })

  if (!owner) {
    throw new HttpException(StatusCodes.BAD_GATEWAY, "Owner details not found")
  }
  return owner
}

const carMapper = (car: Car & { images: Image[] }): CarModel => {
  return {
    name: car.name,
    brand: car.brand,
    imageUrl: car.images.map((image) => image.imageUrl),
    type: car.type,
    isBooked: car.isBooked,
    price: car.pricePerDay,
  }
}

export const addListing = async (id: number, carDetails: Car): Promise<CarModel | null> => {
  const validDetails = (await globalValidator(carValidation, carDetails)) as CarModel

  const owner = await checkOwner(id)
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
  const listedCar = carMapper(car)
  console.log(listedCar)

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

  return carMapper(car)
}

export const deleteListing = async (userId: number, carId: string) => {
  const owner = await checkOwner(userId)

  if (!owner.car.find((car) => car.id === carId)) {
    // I don't know if this check is important cause client will send the carId of their car in general when they look at the cars
    throw new HttpException(StatusCodes.FORBIDDEN, "Invalid Car Owner")
  }
  await prisma.car.delete({ where: { id: carId, ownerId: owner.id } })
}
