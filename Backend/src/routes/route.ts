import { Router } from "express"

import authRoute from "../auth/authController"
import { verifyJwt } from "../auth/authMiddleware"
import userRoute from "../users/userController"

const api = Router().use("/auth", authRoute).use("/user", verifyJwt, userRoute)

export default Router().use("/api", api)
