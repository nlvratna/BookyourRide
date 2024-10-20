import { Request, Response, NextFunction } from "express"
import { HttpException } from "../exception/HttpException"
import { StatusCodes } from "http-status-codes"
import * as jwt from "jsonwebtoken"

export const verifyJwt = (request: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = request.headers.authorization
    if (!authHeader?.startsWith("Bearer ")) {
      throw new HttpException(StatusCodes.UNAUTHORIZED, "Authorization failed")
    }
    const token = authHeader.split(" ")[1]
    // console.log(token)

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET) as jwt.JwtPayload
    request.user = {
      id: decoded.userInfo.id,
      role: decoded.userInfo.role,
    }

    next()
  } catch (error: any) {
    console.log(error)
    res.status(401).json({ message: "Un authorized" })
  }
}
