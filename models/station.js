const mongoose = require('mongoose')

const stationSchema = new mongoose.Schema({

  stationId: {
    type: String,
    required: true,
  },
  StationName: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  operator: {
    type: String,
    required: true,
  },
  capacity: {
    type: Number,
    required: true,
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