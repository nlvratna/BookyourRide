import { Role } from "@prisma/client"
import { NextFunction } from "express"
import { HttpException } from "../exception/HttpException"
import { getStatusCode, StatusCodes } from "http-status-codes"
import CustomRequest from "../utils/CustomRequest"

export const verifyRole = function (req: CustomRequest, next: NextFunction) {
  const { role } = req.user

  if (role === Role.RENTAL_OWNER) next()
  else throw new HttpException(StatusCodes.FORBIDDEN, "Access Denied")
}
