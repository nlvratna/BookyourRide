import { CarType, Image } from "@prisma/client"

export interface CarDetails {
  name: string
  type: CarType
  brand: string
  images: string
  pricePerDay: number
  isBooked: boolean
}
