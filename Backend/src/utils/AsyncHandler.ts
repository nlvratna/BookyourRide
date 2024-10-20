import { Request, Response, NextFunction } from "express"

export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  return Promise.resolve(fn(req, res)).catch(next) // this function  could be anything? can I directly use it on route at the root point of every controller like asyncHandler(userRoute)
}
