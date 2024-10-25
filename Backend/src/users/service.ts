import { StatusCodes } from "http-status-codes"
import { HttpException } from "../exception/HttpException"
import { prisma } from "../utils/PrismaClient"
import { Profile } from "./model"
import { compare, compareSync } from "bcrypt"
import { Owner, Role, Users } from "@prisma/client"
import { boolean } from "zod"

//  Add change password email and otp  phone number verification later

function profileMapper(user: Users, owner?: Owner): Profile {
  return {
    name: user.userName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    location: owner?.location,
    shopName: owner?.shopName,
  }
}

export const getProfile = async (userId: number): Promise<Profile | null> => {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    include: { Owner: true },
  })

  if (!user) {
    throw new HttpException(StatusCodes.NOT_FOUND, "User Details  not found")
  }

  return profileMapper(user, user.Owner)
}

export const changeDetails = async (userId: number, details: Profile): Promise<Profile | null> => {
  const user = await prisma.users.findUnique({ where: { id: userId } })
  //use otp for validation
  if (!user) {
    throw new HttpException(StatusCodes.NOT_FOUND, "User not found")
  }

  if (user.role === Role.RENTAL_OWNER) {
    const userDetails = await prisma.owner.update({
      where: { userId },
      data: details,
      include: { details: true },
    })
    return profileMapper(userDetails.details, userDetails)
  } else {
    const userDetails = await prisma.users.update({ where: { id: userId }, data: details })

    return profileMapper(userDetails)
  }
}

export const deleteAccount = async (userId: number, password: string) => {
  const user = await prisma.users.findUnique({
    where: { id: userId },
  })

  if (!user) {
    throw new HttpException(StatusCodes.NOT_FOUND, "User not found")
  }

  if (!compareSync(password, user.password)) {
    throw new HttpException(StatusCodes.UNAUTHORIZED, "Incorrect password")
  }

  await prisma.users.delete({ where: { id: user.id } })
}
