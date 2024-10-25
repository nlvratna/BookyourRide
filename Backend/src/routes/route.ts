import { Router } from "express"

import authRoute from "../auth/controller"
import { verifyJwt } from "../auth/authMiddleware"
import userRoute from "../users/controller"
import { verifyRole } from "../auth/roleMiddleware"
import listingRoute from "../listings/controller"
import ownerRoute from "../users/owner/controller"
import imageRoute from "../listings/images/controller"

const api = Router()
  .use("/auth", authRoute)
  .use("/user", verifyJwt, userRoute)
  .use("/owner", verifyJwt, verifyRole, listingRoute, ownerRoute, imageRoute)

export default Router().use("/api", api)
