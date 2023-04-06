const Trip = require('../models/trip')

const resolvers = {
  Query: {
    TripCount: async () => Trip.collection.countDocuments(),
  }
}

module.exports = resolvers
