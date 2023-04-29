
const { ApolloServer } = require('@apollo/server')
const mongoose = require('mongoose').set('strictQuery',false)
const config = require('../utils/config')

const resolvers = require('../graphql/resolver')
const typeDefs = require('../graphql/schema')

const Trip = require('../models/trip')
const Station = require('../models/station')

const path = require('path')
const processFile = require('../utils/processFile')

let testServer
beforeAll(async () => {

  await mongoose.connect(config.MONGODB_URI)
  testServer = new ApolloServer({
    typeDefs,
    resolvers,
  })

  await Trip.deleteMany({})
  await Station.deleteMany({})
  const testTripsFile = path.join('__dirname','../test/trips-sample-test.csv')
  await processFile(testTripsFile)
  const testStationFile = path.join('__dirname','../test/station-sample-test.csv')
  await processFile(testStationFile)

},100000)


describe('Test GraphQL server for returning Trips', () => {

  test('Returns trips with the provided page & rows', async () => {
    const response = await testServer.executeOperation({
      query: 'query TRIPS( $page: Int!, $rows: Int!) { Trips(page:  $page, rows:  $rows){ departureStationId, returnStationId} }',
      variables: { page: 1, rows:5 },
    })
    expect(response.body.singleResult.errors).toBeUndefined()
    expect(response.body.singleResult.data?.Trips[3].departureStationId).toBe('004')
    expect(response.body.singleResult.data?.Trips[0].departureStationId).toBe('003')
    expect(response.body.singleResult.data?.Trips[2]).toEqual({ 'departureStationId': '007', 'returnStationId': '010' })
  })

  test('Convert Distance to Km and duration to min', async () => {
    const response = await testServer.executeOperation({
      query: 'query TRIPS( $page: Int!, $rows: Int!) { Trips(page:  $page, rows:  $rows){ distance, duration } }',
      variables: { page: 1, rows:5 },
    })
    expect(response.body.singleResult.errors).toBeUndefined()
    expect(response.body.singleResult.data?.Trips[3].distance).toBe(3.15)
  })

  test('Read total number of trips', async () => {
    const response = await testServer.executeOperation({
      query: 'query TRIPS { TripCount }',
    })
    expect(response.body.singleResult.errors).toBeUndefined()
    expect(response.body.singleResult.data?.TripCount).toBe(43)
  })
})

describe('Test GraphQL server for returning Stations', () => {

  test('Returns stations with the provided page & rows', async () => {
    const response = await testServer.executeOperation({
      query: 'query STATION( $page: Int!, $rows: Int! ,$sortParam: String, $sortOrder:Int) { Stations(page:  $page, rows:  $rows, sortParam: $sortParam, sortOrder: $sortOrder){ stationId, stationName, capacity, gpsPosition{longtitude}} }',
      variables: { page: 1, rows:5, sortParam: 'stationId', sortOrder: 1 },
    })
    expect(response.body.singleResult.errors).toBeUndefined()
    expect(response.body.singleResult.data?.Stations[3].stationId).toBe('010')
    expect(response.body.singleResult.data?.Stations[0].capacity).toBe(18)
    expect(response.body.singleResult.data?.Stations[0]).toHaveProperty('stationId')
    expect(response.body.singleResult.data?.Stations[0]).toHaveProperty('stationName')
    expect(response.body.singleResult.data?.Stations[0]).toHaveProperty('capacity')
    expect(response.body.singleResult.data?.Stations[0]).toHaveProperty('gpsPosition')

  })

  test('Read total number of stations', async () => {
    const response = await testServer.executeOperation({
      query: 'query STATION { StationCount }',
    })
    expect(response.body.singleResult.errors).toBeUndefined()
    expect(response.body.singleResult.data?.StationCount).toBe(13)
  })

  test('Read station list', async () => {
    const response = await testServer.executeOperation({
      query: 'query STATION { StationList { stationId, stationName }}',
    })
    expect(response.body.singleResult.errors).toBeUndefined()
    expect(response.body.singleResult.data?.StationList[5]).toHaveProperty( 'stationId' )
    expect(response.body.singleResult.data?.StationList[5]).toHaveProperty( 'stationName' )
    expect(response.body.singleResult.data?.StationList).toHaveLength(13)
  })
})

describe('Test GraphQL server for returning Statistics', () => {

  test('Returns statistics for the provided statoin', async () => {
    const response = await testServer.executeOperation({
      query: 'query STATISTIC( $stationId: String! ) { StationStatistics(stationId:  $stationId){ totalTripsFrom, totalTripsTo, avrageTripFrom, avrageTripTo}}',
      variables: { stationId: '014' },
    })
    expect(response.body.singleResult.errors).toBeUndefined()
    expect(response.body.singleResult.data?.StationStatistics).toEqual({ 'avrageTripFrom': 4.925, 'avrageTripTo': 3.1735, 'totalTripsFrom': 1, 'totalTripsTo': 4 })
  })

})

afterAll(() => {
  mongoose.connection.close()
})


