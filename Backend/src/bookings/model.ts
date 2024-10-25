import { CarType } from "@prisma/client"

export interface BookingDetails {
  id: string
  carName: string
  carType: CarType
  starDate: Date
  endDate: Date
}

export interface availableCars {
  name: string
  brand: string
  type: CarType
  price: number
  imageUrl: string[]
}
