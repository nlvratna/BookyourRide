import { Car, Owner, Users } from "@prisma/client"
import { prisma } from "../../utils/PrismaClient"

import { HttpException } from "../../exception/HttpException"
import { StatusCodes } from "http-status-codes"
import { CarDetails } from "./model"

export const getListings = async (userId: number): Promise<Car[] | null> => {
  const owner = await prisma.owner.findUnique({ where: { userId }, include: { car: true } }) // images are required

  if (!owner) {
    throw new HttpException(StatusCodes.NOT_FOUND, "Owner details not found")
  }

  return owner.car // this makes sense if the owner wants to make changes the client will have the car Id for every car
}
