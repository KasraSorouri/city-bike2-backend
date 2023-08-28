const mongoose = require('mongoose')

const stationSchema = new mongoose.Schema({

  stationId: {
    type: String,
    required: true,
  },
  stationName: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
  },
  operator: {
    type: String,
  },
  capacity: {
    type: Number,
  },
  longtitude: {
    type: Number,
    require: true,
  },
  latitude: {
    type: Number,
    require: true,
  }
})

stationSchema.index({ stationId:1 },{ unique: true })

module.exports = mongoose.model('Station', stationSchema)