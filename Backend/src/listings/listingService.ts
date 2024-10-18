import { Car, CarType, Image } from "@prisma/client"
import { StatusCodes } from "http-status-codes"
import { HttpException } from "../exception/HttpException"
import { prisma } from "../utils/PrismaClient"
import { CarModel, carValidation } from "./listingModel"
import { globalValidator } from "../utils/GlobalValidator"

export const carMapper = (car: Car & { images: Image[] }): CarModel => {
  return {
    name: car.name,
    brand: car.brand,
    image: car.images.map((img) => img.imageUrl),
    type: car.type,
    isBooked: car.isBooked,
    price: car.pricePerDay,
  }
}

export const addListing = async (id: number, carDetails: Car): Promise<CarModel | null> => {
  const owner = await prisma.owner.findFirst({ where: { userId: id } })

  if (!owner) {
    throw new HttpException(StatusCodes.BAD_GATEWAY, "Owner details not found")
  }
  const validDetails = (await globalValidator(carValidation, carDetails)) as CarModel

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
  return listedCar
}
