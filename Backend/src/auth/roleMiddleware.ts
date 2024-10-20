import { Role } from "@prisma/client"
import { Request, NextFunction, Response } from "express"
import { HttpException } from "../exception/HttpException"
import { StatusCodes } from "http-status-codes"

export const verifyRole = function (req: Request, res: Response, next: NextFunction) {
  const role: Role = req.user?.role

  if (role === Role.RENTAL_OWNER) next()
  else throw new HttpException(StatusCodes.FORBIDDEN, "Access Denied")
}
