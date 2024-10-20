import { Role } from "@prisma/client"
import { Request } from "express"

interface CustomRequest extends Request {
  user?: {
    id?: number
    role?: Role
  }
}
//No need of this anymore remove this later
