import dotenv from "dotenv"

dotenv.config()
const bucketName = process.env.BUCKET_NAME
const bucketRegion = process.env.BUCKET_REGION
const accessKey = process.env.BUCKET_ACCESS_KEY
const secretKey = process.env.BUCKET_SECRET_ACCESS_KEY
console.log(bucketName)
console.log(accessKey)
console.log(secretKey)
console.log(bucketRegion)
