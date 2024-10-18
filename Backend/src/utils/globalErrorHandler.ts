import { Response, Request, NextFunction } from "express"
import { HttpException } from "../exception/HttpException"
import { ZodException } from "../exception/ZodException"

const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof HttpException) {
    res.status(err.status).json({
      status: err.status,
      message: err.message,
    })
  } else if (err instanceof ZodException) {
    res.status(422).json({ status: err.status, message: err.issues.errors.map((e) => e.message).join(" ") })
  } else {
    res.status(500).json({ message: err.stack || "Internal Server Error" })
  }
}

export default globalErrorHandler
