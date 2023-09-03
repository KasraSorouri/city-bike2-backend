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
      .attach('csvFile',`${__dirname}/trips-sample-test.csv`)
      .expect(200)
      .expect('content-type', /application\/json/)
    expect(response.text).toContain('{"status":"file uploaded successfully!"')
  })

  test('Only valid trips add to the database', async() => {
    const trips = await Trip.find({})
    expect(trips).toHaveLength(43)
  })

  test('Station file with correct format is converted to Station model', async() => {
    await Station.deleteMany({})
    const response = await api
      .post('/api/upload/upload-csv')
      .attach('csvFile',`${__dirname}/station-sample-test.csv`)
      .expect(200)
      .expect('content-type', /application\/json/)
    expect(response.text).toContain('{"status":"file uploaded successfully!"')
  })

  test('Only valid stations add to the database', async() => {
    const stations = await Station.find({})
    expect(stations).toHaveLength(15)
  })
})

afterAll(() => {
  mongoose.connection.close()
})