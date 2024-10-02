import { Router } from "express"
import authRoute from "../auth/authController"

const userRouter = Router()

userRouter.use("/users", authRoute)

export default userRouter
