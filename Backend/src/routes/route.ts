import { Router } from "express"

import userRouter from "./userRoute"

const api = Router().use("/auth", userRouter)

export default Router().use("/api", api)
