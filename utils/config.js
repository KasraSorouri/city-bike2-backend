require('dotenv').config()

const PORT = process.env.PORT
const MONGODB_URI = process.env.MONGODB_URI

const GraphQL_PATH = '/api/citybike'

module.exports = {
  MONGODB_URI,
  PORT,
  GraphQL_PATH
}