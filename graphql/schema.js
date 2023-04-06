const typeDefs = `
  type Trip {
    departure: String!
    return: String!
    departureStationId: String!
    departureStationName: String!
    returnStationId: String!
    returnStationName: String!
    distance: Int!
    duration: Int!
  }

  type Query {
    TripCount: Int!
  }
`
module.exports = typeDefs