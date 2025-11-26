import express, { Express, Request, Response } from "express"
import authRoute from "./auth/controller"

import route from "./routes/route"
import cookieParser from "cookie-parser"
import globalErrorHandler from "./utils/GlobalErrorHandler"

const app: Express = express()
app.use(express.json())
app.use(cookieParser())

app.use(route)

app.use(globalErrorHandler)

app.listen(8080, () => {
  console.log(`Sever running on port 8080`)
})
