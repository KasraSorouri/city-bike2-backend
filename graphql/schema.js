const typeDefs = `
  type Trip {
    departure: String!
    return: String!
    departureStationId: String!
    departureStationName: String!
    returnStationId: String!
    returnStationName: String!
    distance: Float!
    duration: Float!
  }


  type GPS {
    longtitude: Float!
    latitude: Float!
  }
  type Station {
    stationId: String!
    stationName: String!
    address: String!
    city: String
    operator: String
    capacity: Float
    gpsPosition: GPS
  }

  type TimeRange {
    earliest: String!
    latest: String!
  }

  type CounterpartStationStatistic {
    stationId: String!
    count: Int!
    aveDuration: Float!
    minDuration: Float!
    maxDuration: Float!
    aveDistance: Float!
    minDistance: Float!
    maxDistance: Float!
  }

  type Statistics {
    totalTripsFrom: Int!
    totalTripsTo: Int!
    avrageTripFrom: Float!
    avrageTripTo: Float!
    popularDestination: [CounterpartStationStatistic!]
    popularOrigin: [CounterpartStationStatistic!]
    roundTrip: [CounterpartStationStatistic!]
  }

  type Query {
    TripCount: Int!
    StationCount: Int!
    Trips( departureStation: String, returnStation: String, departureTimeFrom: String, returnTimeTo: String, 
      distanceFrom: Int, distanceTo: Int, durationFrom:Int, durationTo:Int, page: Int!, rows: Int!, sortParam: String, sortOrder:Int): [Trip!]
    Stations(stationId: String, city: String, operator: String, page: Int!, rows: Int!, sortParam: String, sortOrder:Int):[Station!]
    StationList:[Station!]
    TimeRanges: TimeRange!
    StationStatistics (stationId : String!) : Statistics!
  }
`
module.exports = typeDefs