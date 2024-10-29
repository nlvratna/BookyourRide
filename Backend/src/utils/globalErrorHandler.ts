import { Response, Request, NextFunction } from "express"
import { HttpException } from "../exception/HttpException"
import { ZodException } from "../exception/ZodException"
import { Prisma } from "@prisma/client"
const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof HttpException) {
    res.status(err.status).json({
      status: err.status,
      message: err.message,
    })
  } else if (err instanceof ZodException) {
    res.status(422).json({ status: err.status, message: err.issues.errors.map((e) => e.message).join(" ") })
  } else if (err.code === "P2025") {
    res.status(400).json({ message: "Invalid car owner" })
  } else {
    res.status(500).json({ message: err.message || "Internal Server Error" })
    console.log(err.stack)
  }
}

export default globalErrorHandler
