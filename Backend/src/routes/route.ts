import { Router } from "express"

import authRoute from "../auth/authController"
import { verifyJwt } from "../auth/authMiddleware"
import userRoute from "../users/userController"
import { verifyRole } from "../auth/roleMiddleware"
import listingRoute from "../listings/listingController"

const api = Router().use("/auth", authRoute).use("/user", verifyJwt, userRoute).use("/owner", verifyJwt, verifyRole, listingRoute)

export default Router().use("/api", api)
