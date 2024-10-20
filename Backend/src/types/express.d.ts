import { Role } from "@prisma/client"

declare global {
  namespace Express {
    interface Request {
      user?: {
        id?: number
        role?: Role
      }
    }
  }
}
// This doesn't work for me
