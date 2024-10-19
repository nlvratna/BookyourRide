import { Role } from "@prisma/client"
import { NextFunction, Response } from "express"
import { HttpException } from "../exception/HttpException"
import { getStatusCode, StatusCodes } from "http-status-codes"
import CustomRequest from "../utils/CustomRequest"

export const verifyRole = function (req: CustomRequest, res: Response, next: NextFunction) {
  const role: Role = req.user?.role

  if (role === Role.RENTAL_OWNER) next()
  else throw new HttpException(StatusCodes.FORBIDDEN, "Access Denied")
}
