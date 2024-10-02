import { Response, Request, NextFunction } from 'express'
import { HttpException } from '../exception/HttpException'

const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof HttpException) {
    res.status(err.status).json({
      status: err.status,
      message: err.message,
    })
  } else {
    res.status(500).json({ message: err.message || 'Internal Server Error' })
  }
}

export default globalErrorHandler
