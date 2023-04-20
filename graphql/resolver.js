const Trip = require('../models/trip')
const Station = require('../models/station')

const resolvers = {

  Trip: {
    departure: (root) => (root.departure).toISOString().substring(0, 16),
    return: (root) => new Date(root.return).toISOString().substring(0, 16),
    duration: (root) => root.duration / 60,
    distance: (root) => root.distance / 1000,
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

  CounterpartStationStatistic : {
    stationId: (root) => root._id,
    aveDuration: (root) => root.aveDuration / 60,
    minDuration: (root) => root.minDuration / 60,
    maxDuration: (root) => root.maxDuration / 60,
    aveDistance: (root) => root.aveDistance / 1000,
    minDistance: (root) => root.minDistance / 1000,
    maxDistance: (root) => root.maxDistance / 1000,
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
      departureStation ? searchParameter.departureStationId = departureStation : null
      returnStation ? searchParameter.returnStationId = returnStation : null

      distanceFrom && distanceTo ? searchParameter.distance = { $gte: distanceFrom * 1000, $lte: distanceTo * 1000 } : null
      distanceFrom && !distanceTo ? searchParameter.distance = { $gte: distanceFrom *1000 } : null
      !distanceFrom && distanceTo ? searchParameter.distance = { $lte: distanceTo * 1000 } : null

      durationFrom && durationTo ? searchParameter.duration = { $gte: durationFrom * 60 , $lte: durationTo * 60 } : null
      durationFrom && !durationTo ? searchParameter.duration = { $gte: durationFrom * 60 } : null
      !durationFrom && durationTo ? searchParameter.duration = { $lte: durationTo * 60 } : null

      departureTimeFrom ? searchParameter.departure = { $gte: departureTimeFrom } : null

      // Add the selected day to the filter range
      const reformedDate = new Date(returnTimeTo)
      reformedDate.setDate(reformedDate.getDate()+1)
      returnTimeTo ? searchParameter.return = { $lte: reformedDate } : null

      const result = await Trip.find({ ...searchParameter }).sort(sort).skip(page*rows).limit(rows)
      return result
    },
    Stations: async (root, args) => {
      const { page, rows, stations, city, operator, sortParam, sortOrder } = args

      // make Stations's sort parameter
      let sort = {}
      sortParam ? sort[sortParam] = sortOrder : null
      // make Stations's search parameter
      let searchParameter = {}
      stations  ? searchParameter.stationId  = stations : null
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
      return result[0]
    },
    StationStatistics: async(root,args) => {
      const { stationId, timeFrom, timeTo } = args

      // make Statistics's search parameter
      let searchParameter = {}
      timeFrom ? searchParameter.departure = { $gte: new Date(timeFrom) } : null
      timeTo ? searchParameter.return = { $lte: new Date(timeTo) } : null

      // Calculate statistics ...
      const avrageTripFrom =  await Trip.aggregate([
        { $match: { $and: [{ departureStationId: stationId }, { ...searchParameter }] } },
        { $group: {
          _id: null,
          distance: { $avg: '$distance' }
        } }
      ])

      const avrageTripTo = await Trip.aggregate([
        { $match:  { $and: [{ returnStationId: stationId }, { ...searchParameter }] } },
        { $group: {
          _id: null,
          distance: { $avg: '$distance' }
        } }
      ])

      const popularDestination = await Trip.aggregate([
        { $match: { $and: [{ departureStationId: stationId }, { ...searchParameter }] } },
        { $group: {
          _id: '$returnStationId' ,
          count: { $sum: 1 },
          aveDuration: { $avg: '$duration' },
          minDuration: { $min: '$duration' },
          maxDuration: { $max: '$duration' },
          aveDistance: { $avg: '$distance' },
          minDistance: { $min: '$distance' },
          maxDistance: { $max: '$distance' },
        }
        },
        { $sort: { count: -1 } }
      ]).limit(5)

      const popularOrigin = await Trip.aggregate([
        { $match: { $and: [{ returnStationId: stationId }, { ...searchParameter }] } },
        { $group: {
          _id: '$departureStationId',
          count: { $sum: 1 },
          aveDuration: { $avg: '$duration' },
          minDuration: { $min: '$duration' },
          maxDuration: { $max: '$duration' },
          aveDistance: { $avg: '$distance' },
          minDistance: { $min: '$distance' },
          maxDistance: { $max: '$distance' },
        }
        },
        { $sort: { count: -1 } }
      ]).limit(5)

      const roundTrip = await Trip.aggregate([
        { $match: { $and: [{ departureStationId: stationId , returnStationId: stationId }, { ...searchParameter }] } },
        { $group: {
          _id: '$departureStationId',
          count: { $sum: 1 },
          aveDuration: { $avg: '$duration' },
          minDuration: { $min: '$duration' },
          maxDuration: { $max: '$duration' },
          aveDistance: { $avg: '$distance' },
          minDistance: { $min: '$distance' },
          maxDistance: { $max: '$distance' },
        }
        }
      ])
      // end of calculation statistics

      const result = {
        totalTripsFrom :await Trip.find({ $and: [{ departureStationId: stationId }, { ...searchParameter }] }).count(),
        totalTripsTo : await Trip.find({ $and: [{ returnStationId: stationId }, { ...searchParameter }] }).count(),
        avrageTripFrom : avrageTripFrom[0] ? avrageTripFrom[0].distance / 1000 : null,
        avrageTripTo : avrageTripTo[0] ? avrageTripTo[0].distance / 1000 : null,
        popularDestination,
        popularOrigin,
        roundTrip,
      }
      return result
    },
  }
}

module.exports = resolvers
