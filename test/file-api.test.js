const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

const api = supertest(app)

const Trip = require('../models/trip')
const Station = require('../models/station')


describe('test file handeling', () => {
  test('Trip file with correct format is converted to trip model', async() => {
    await Trip.deleteMany({})
    const response = await api
      .post('/api/upload/upload-csv')
      .attach('csvFile',`${__dirname}/testTrips.csv`)
      .expect(200)
      .expect('content-type', /application\/json/)
    expect(response.text).toContain('trip')
  },1000)

  test('Only valid trips add to the database', async() => {
    const trips = await Trip.find({})
    expect(trips).toHaveLength(47)
  })

  test('Station file with correct format is converted to Station model', async() => {
    await Station.deleteMany({})
    const response = await api
      .post('/api/upload/upload-csv')
      .attach('csvFile',`${__dirname}/testStations.csv`)
      .expect(200)
      .expect('content-type', /application\/json/)
    expect(response.text).toContain('station')
  },2000)

  test('Only valid stations add to the database', async() => {
    const stations = await Station.find({})
    expect(stations).toHaveLength(99)
  })
})

afterAll(() => {
  mongoose.connection.close()
})