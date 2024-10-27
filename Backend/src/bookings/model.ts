import { CarType } from "@prisma/client"
// I might not need this and I might delete this
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
