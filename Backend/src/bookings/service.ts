import { Car } from "@prisma/client"
import { prisma } from "../utils/PrismaClient"
import { availableCars } from "./model"
import { HttpException } from "../exception/HttpException"
import { StatusCodes } from "http-status-codes"

export const getCars = async (location?: string): Promise<availableCars[] | null> => {
  console.log(location)

  const cars = await prisma.car.findMany({
    where: {
      isBooked: false,
      owner: {
        location: { equals: location, mode: "insensitive" },
      },
    },
    include: {
      images: true,
    },
  })
  if (cars.length === 0) {
    throw new HttpException(StatusCodes.NOT_FOUND, "Car's not available or invalid location")
  }
  const availableCars: availableCars[] = cars.map((car) => ({
    name: car.name,
    brand: car.brand,
    type: car.type,
    price: car.pricePerDay,
    imageUrl: car.images.map((image) => image.imageUrl),
  }))

  return availableCars
}

export const bookCar = async (carId: string) => {}
