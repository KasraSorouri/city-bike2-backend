const dataValidator = require('./dataValidator')
const logger = require('./logger')

const processData = (data) => {

  if ('﻿Departure' in data &&
      'Return' in data &&
      'Departure station id' in data &&
      'Departure station name' in data &&
      'Return station id' in data &&
      'Return station name' in data &&
      'Covered distance (m)' in data &&
      'Duration (sec.)' in data) {

    const tripData = dataValidator.tripDataProcessor(data)
    return { dataType: 'trip', status: tripData.status , data: tripData.tripRawData }

  } else if ('ID' in data &&
             'Name' in data &&
             'Adress' in data &&
             'Kaupunki' in data &&
             'Operaattor' in data &&
             'Kapasiteet' in data &&
             'x' in data &&
             'y' in data) {

    const stationData = dataValidator.stationDataProcessor(data)

    return { dataType: 'station', status: stationData.status , data: stationData.stationRawData }
  } else {
    logger.error({ error: 'the csvFile is not in right format' })
    return { error: 'the csvFile is not in right format' }
  }
}
module.exports = processData