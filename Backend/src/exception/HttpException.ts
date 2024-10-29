export class HttpException {
  status?: number
  message: string
  constructor(status: number, message: string) {
    // super(message)
    this.status = status
    this.message = message
  }
}
