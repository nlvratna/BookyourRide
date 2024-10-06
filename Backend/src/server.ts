import express, { Express, Request, Response, Router } from "express"
import authRoute from "./auth/authController"
import globalErrorHandler from "./utils/globalErrorHandler"
import route from "./routes/route"
import cookieParser from "cookie-parser"

const app: Express = express()
app.use(express.json())
app.use(cookieParser())

const api = Router().use("/auth", authRoute)

app.use(route)

app.use(globalErrorHandler)

app.listen(8080, () => {
  console.log("Server running ")
})
