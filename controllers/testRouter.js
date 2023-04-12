const testRouter = require('express').Router()
const Trip = require('../models/trip')
const Station = require('../models/station')
const processFile = require('../utils/processFile')
const path = require('path')

testRouter.post('/reset', async (request, response) => {
  await Trip.deleteMany({})
  await Station.deleteMany({})
  response.status(204).end()
})

testRouter.post('/upload-csv', async (request, response) => {
  const testTripsFile = path.join('__dirname','../tests/testTrips.csv')
  await processFile.processTrip(testTripsFile)
  const testStationFile = path.join('__dirname','../tests/testStations.csv')
  await processFile.processStation(testStationFile)
  response.status(204).end()
})

module.exports = testRouter