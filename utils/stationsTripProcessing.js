
const Trip = require('../models/trip')
const Station = require('../models/station')
const StationDynamicData = require('../models/stationsDynamicData')

// Analised stationTips data and write them on Database
const stationDataProcess = async() => {
  await StationDynamicData.deleteMany({})
  const stations = await Station.find({})

  // Analysed trips for each station
  for ( const station of stations) {
    const stationTripsData = await stationTripsProcess({
      stationId : station.stationId,
      stationCapacity: station.capacity
    })
    await StationDynamicData.insertMany(stationTripsData)
  }
  const finalResult = await StationDynamicData.find({}).countDocuments()
  return finalResult
}

// Station's Trip Processing
const stationTripsProcess = async ({ stationId , stationCapacity } ) => {

  let stationTrips = []
  // reading trips from Database
  const departureTrips = await Trip.find({ departureStationId : stationId })
  const returnTrips = await Trip.find({ returnStationId : stationId })

  // Processing trips
  departureTrips.map(trip => {
    stationTrips.push({ timeStamp: trip.departure, stationId: trip.departureStationId, actionType: 'departure', oppositeStation: trip.returnStationId })
  })
  returnTrips.map(trip => {
    stationTrips.push({ timeStamp: trip.return, stationId: trip.returnStationId, actionType: 'return', oppositeStation: trip.departureStationId })
  })

  // sorting trips based on timeStamp for further calculation
  const stationSortedTrip = stationTrips.sort ( ( a, b ) => a.timeStamp - b.timeStamp )

  // Min and Max acceptable bikes in the station
  const minAcceptable = Math.max( Math.floor(stationCapacity * 0.1 ) , 1 )
  const maxAcceptable = Math.floor(stationCapacity * 2 )

  let stationBike = stationCapacity
  let modifiedBikes = stationCapacity // Supposed that bikes are charged and discharged if reach the limited borders

  // calculate the amount of bikes in station
  stationSortedTrip.forEach( async trip => {
    if ( trip.actionType === 'departure') {
      stationBike--
      modifiedBikes--
      trip.bikeQty = stationBike
      if ( modifiedBikes < minAcceptable ) {
        modifiedBikes = stationCapacity
        stationSortedTrip.mutation = 'Charge'
      }
      trip.modifiedBikeQty = modifiedBikes
    }
    if ( trip.actionType === 'return') {
      stationBike++
      modifiedBikes++
      trip.bikeQty = stationBike
      if ( modifiedBikes > maxAcceptable ) {
        modifiedBikes = stationCapacity
        stationSortedTrip.mutation = 'decharge'
      }
      trip.modifiedBikeQty = modifiedBikes
    }
  })
  return stationSortedTrip
}

// Read analysed data from the database
const getProcessedData = async (stationId) => {
  const station = await Station.find({ stationId: stationId })
  const analysedData = await StationDynamicData.find({ stationId: stationId })
  const result = { station, analysedData }
  return result
}

// Destination Analysis
const destinationData = async (stationId) => {
  const destinations = await StationDynamicData.aggregate([
    { $match: { $and: [{ stationId: stationId }] } },
    { $group: {
      _id: {
        actionType: '$actionType',
        oppositeStation: '$oppositeStation'
      },
      count: { $sum: 1 },
    }
    },
    { $sort: { count: -1 } }
  ])

  let result = []
  destinations.forEach(destination => {
    if ( destination._id.actionType === 'departure' ) {
      result.push({
        source : stationId,
        target : destination._id.oppositeStation,
        value : destination.count
      })
    }
    if ( destination._id.actionType === 'return' ) {
      result.push({
        source : destination._id.oppositeStation,
        target : stationId,
        value : destination.count
      })
    }
  })
  return result
}

module.exports =  {
  stationDataProcess,
  getProcessedData,
  destinationData
}