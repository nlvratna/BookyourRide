import { Car } from "@prisma/client"
import { prisma } from "../utils/PrismaClient"
import { HttpException } from "../exception/HttpException"
import { StatusCodes } from "http-status-codes"

export const getCars = async (location?: string): Promise<Car[] | null> => {
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
  // Images should be managed in the front end
  return cars
}

export const bookCar = async (carId: string, userId: number, startDate: Date, endDate: Date) => {
  const car = await prisma.car.findUnique({ where: { id: carId } })

  if (car.isBooked) {
    throw new HttpException(StatusCodes.CONFLICT, "car is already booked")
  }
  return await prisma.$transaction(async (tx) => {
    const booking = await tx.bookings.create({
      data: {
        startDate,
        endDate,
        car: { connect: { id: carId } },
        bookedBy: { connect: { id: userId } },
      },
      select: {
        car: true,
      },
    })
    await tx.car.update({
      where: { id: carId },
      data: {
        isBooked: true,
      },
    })
    return booking
  })
}
