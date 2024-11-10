import { Car, CarType, Image, Prisma } from "@prisma/client"
import { StatusCodes } from "http-status-codes"
import { HttpException } from "../exception/HttpException"
import { prisma } from "../utils/PrismaClient"
import { CarModel, carValidation } from "./model"
import { globalValidator } from "../utils/GlobalValidator"
import { deleteObject } from "../images/service"

const checkOwner = async (userId: number) => {
  const owner = await prisma.owner.findFirst({ where: { userId: userId }, include: { car: true } })

  if (!owner) {
    throw new HttpException(StatusCodes.BAD_GATEWAY, "Owner details not found")
  }
  return owner
}

export const addListing = async (id: number, carDetails: CarModel): Promise<Car | null> => {
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

  return car
}

export const updateListing = async (userId: number, carId: string, carDetails: CarModel): Promise<Car | null> => {
  const car: Car | null = await prisma.car
    .update({
      where: {
        id: carId,
        owner: {
          details: {
            id: userId,
          },
        },
      },
      data: carDetails,
      include: {
        images: true,
      },
    })
    .catch(() => {
      throw new HttpException(StatusCodes.BAD_REQUEST, `Invalid owner for the car id : ${carId} `)
    })

  return car
}

export const deleteListing = async (userId: number, carId: string) => {
  // const owner = await checkOwner(userId)

  // if (!owner.car.find((car) => car.id === carId)) {
  //   // I don't know if this check is important cause client will send the carId of their car in general when they look at the cars
  //   throw new HttpException(StatusCodes.FORBIDDEN, "Invalid Car Owner")
  // }

  await deleteObject(carId)

  await prisma.car
    .delete({
      where: {
        id: carId,
        owner: {
          details: {
            id: userId,
          },
        },
      },
    })
    .catch(() => {
      throw new HttpException(StatusCodes.BAD_REQUEST, `Invalid owner for the car id : ${carId} `)
    })
}
