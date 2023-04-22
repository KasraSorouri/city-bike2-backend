const express = require('express')
const cors = require('cors')
const http = require('http')

const config = require('./utils/config')
const logger = require('./utils/logger')
const fileReader = require('./controllers/fileReader')

const { ApolloServer } = require('@apollo/server')
const { expressMiddleware } = require('@apollo/server/express4')
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer')
const { makeExecutableSchema } = require('@graphql-tools/schema')

const resolvers = require('./graphql/resolver')
const typeDefs = require('./graphql/schema')

//Databse connection
const mongoose = require('mongoose').set('strictQuery',false)

const mongoOptions = {
  autoIndex: true, // Don't build indexes
  maxPoolSize: 50, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 60000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 300000, // Close sockets after 45 seconds of inactivity
}

logger.info('connecting to ',config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI,mongoOptions)

  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('error connecting to MongoDB:',error.message)
  })


const app = express()
app.use(express.json(), cors())
app.use(express.static('build'))

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
  logger.info('server is ping! -> pong')
  res.send('<h1>pong!</h1>')
} )

app.use('/api/upload',fileReader)

//Test root
if (process.env.NODE_ENV === 'test') {
  const testRouter = require('./controllers/testRouter')
  app.use('/test', testRouter)
}

module.exports = app