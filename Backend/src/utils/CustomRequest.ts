import { Role } from "@prisma/client"
import { Request } from "express"

interface CustomRequest extends Request {
  user?: {
    id?: number
    role?: Role
  }
}

export default CustomRequest
