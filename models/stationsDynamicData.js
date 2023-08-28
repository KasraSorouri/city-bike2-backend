const mongoose = require('mongoose')

const stationDynamicDataSchema = new mongoose.Schema({
  timeStamp: {
    type: Date,
    required: true,
  },
  stationId: {
    type: String,
    required: true,
  },
  oppositeStation: {
    type: String,
    required: true,
  },
  actionType: {
    type: String,
    required: true,
  },
  bikeQty: {
    type: Number,
    required: true,
  },
  modifiedBikeQty: {
    type: Number,
    required: true,
  },
  mutation: {
    type: String,
  }
})
stationDynamicDataSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})
module.exports = mongoose.model('StationDynamicData', stationDynamicDataSchema)