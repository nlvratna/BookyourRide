import { CarType, Image } from "@prisma/client"
import { z } from "zod"
export interface CarModel {
  name: string
  brand: string
  type: CarType
  price: number
}

export const carValidation = z.object({
  name: z.string({ required_error: "name of car is required" }),
  brand: z.string({ required_error: "Brand of car is required" }),
  price: z.number({ required_error: "Price is required" }),
})
