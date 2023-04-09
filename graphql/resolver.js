const Trip = require('../models/trip')
const Station = require('../models/station')

const resolvers = {

  Trip: {
    departure: (root) => (root.departure).toISOString().substring(0, 16),
    return:(root) => new Date(root.return).toISOString().substring(0, 16),
    distance: (root) => root.distance/1000,
    duration: (root) => root.duration/60,
  },

  Station: {
    gpsPosition: (root) => {
      return {
        longtitude: root.longtitude,
        latitude: root.latitude,
      }
    }
  },

  TimeRange: {
    earliest: (root) => (root.earliest).toISOString().substring(0, 16),
    latest: (root) => (root.latest).toISOString().substring(0, 16),
  },

  Query: {
    TripCount: async () => Trip.collection.countDocuments(),
    StationCount: async () => Station.collection.countDocuments(),
    Trips: async (root, args) => {
      const { departureStation, returnStation, departureTimeFrom, returnTimeTo,
        distanceFrom, distanceTo, durationFrom, durationTo, page, rows, sortParam, sortOrder } = args

      // make Trip's sort parameter
      let sort = {}
      sortParam ? sort[sortParam] = sortOrder : null

      // make Trip's Search parameter
      let searchParameter = {}
      departureStation ? searchParameter.departureStation = departureStation : null
      returnStation ? searchParameter.returnStation = returnStation : null
      departureTimeFrom ? searchParameter.departure = { $gte: departureTimeFrom } : null
      returnTimeTo ? searchParameter.return = { $lte: returnTimeTo } : null

      distanceFrom && distanceTo ? searchParameter.distance = { $gte: distanceFrom*1000 , $lte: distanceTo*1000 } : null
      distanceFrom && !distanceTo ? searchParameter.distance = { $gte: distanceFrom*1000 } : null
      !distanceFrom && distanceTo ? searchParameter.distance = { $lte: distanceTo*1000 } : null

      durationFrom && durationTo ? searchParameter.duration = { $gte: durationFrom*60 , $lte: durationTo*60 } : null
      durationFrom && !durationTo ? searchParameter.duration = { $gte: durationFrom*60 } : null
      !durationFrom && durationTo ? searchParameter.duration = { $lte: durationTo*60 } : null

      const result = await Trip.find({ ...searchParameter }).sort(sort).skip(page*rows).limit(rows)
      return result
    },
    Stations: async (root, args) => {
      const { page, rows, stationId, city, operator, sortParam, sortOrder } = args

      // make Stations's sort parameter
      let sort = {}
      sortParam ? sort[sortParam] = sortOrder : null

      // make Stations's search parameter
      let searchParameter = {}
      stationId  ? searchParameter.stationId  = stationId : null
      city ? searchParameter.city = city : null
      operator  ? searchParameter.operator  = operator : null

      const result = await Station.find({ ...searchParameter }).sort(sort).skip(page*rows).limit(rows)
      return result
    },
    StationList: async() => Station.find({}),
    TimeRanges: async() => {
      const result = await Trip.aggregate([
        { $match: {} },
        { $group: {
          _id: null,
          earliest: { $min: '$departure' },
          latest: { $max: '$return' }
        } }
      ])
      console.log('time result range ->', result)
      return result[0]
    }
  }
}

module.exports = resolvers
