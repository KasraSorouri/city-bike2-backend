const mongoose = require('mongoose')

const tripSchema = new mongoose.Schema({
  departure: {
    type: Date,
    required: true,
  },
  return: {
    type: Date,
    required: true,
  },
  departureStationId: {
    type: String,
    required: true,
  },
  departureStationName: {
    type: String,
    required: true,
  },
  returnStationId: {
    type: String,
    required: true,
  },
  returnStationName: {
    type: String,
    required: true,
  },
  distance: {
    type: Number,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
})

tripSchema.index({ distance: 1, dearture: 1, departureStationId: 1, returnStationId: 1, return: 1  },{ unique: true })

module.exports = mongoose.model('Trip', tripSchema)