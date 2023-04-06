const express = require('express')
const cors = require('cors')

const config = require('./utils/config')
const logger = require('./utils/logger')

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

app.use(
  cors(),
  express.json(),
)

app.get('/ping', (req, res) => {
  logger.info('pong')
  res.send('<h1>pong!</h1>')
} )

module.exports = app