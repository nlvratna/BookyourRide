import express, { Express, Request, Response, Router } from "express"
import authRoute from "./auth/authController"
import globalErrorHandler from "./utils/globalErrorHandler"
import route from "./routes/route"

const app: Express = express()
app.use(express.json())

const api = Router().use("/auth", authRoute)

app.use(route)

app.use(globalErrorHandler)

app.listen(8080, () => {
  console.log("Server running ")
})
