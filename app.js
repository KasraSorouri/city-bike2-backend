const express = require('express')
const cors = require('cors')
const http = require('http')

const config = require('./utils/config')
const logger = require('./utils/logger')

const { ApolloServer } = require('@apollo/server')
const { expressMiddleware } = require('@apollo/server/express4')
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer')
const { makeExecutableSchema } = require('@graphql-tools/schema')

const resolvers = require('./graphql/resolver')
const typeDefs = require('./graphql/schema')

//Databse connection
const mongoose = require('mongoose').set('strictQuery',false)

logger.info('connecting to ',config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('erroe connecting to MongoDB:',error.message)
  })


const app = express()
app.use(express.json(), cors())

//Apollo server configuration
const start = async () => {
  const httpServer = http.createServer(app)

  const server = new ApolloServer({
    schema: makeExecutableSchema({ typeDefs, resolvers }),
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  },
  )

  await server.start()

  app.use(
    config.GraphQL_PATH,
    expressMiddleware(server),
  )
}

start()

//Outside of Apollo server
app.get('/ping', (req, res) => {
  logger.info('pong')
  res.send('<h1>pong!</h1>')
} )

module.exports = app