const dataValidator = require('./dataValidator')

const processData = async (data) => {
  if ('Departure' in data &&
      'Return' in data &&
      'Departure station id' in data &&
      'Departure station name' in data &&
      'Return station id' in data &&
      'Return station name' in data &&
      'Covered distance (m)' in data &&
      'Duration (sec.)' in data) {

    const trip = dataValidator.tripDataProcessor(data)

    if (trip.validation === 'invalid') {
      console.log('Trip data is invalid!')
      return trip
    }
    console.log('Trip data is valid * ', trip.tripRawData)
    return trip
  }

  if ('ID' in data &&
      'Name' in data &&
      'Adress' in data &&
      'Kaupunki' in data &&
      'Operaattor' in data &&
      'Kapasiteet' in data &&
      'x' in data &&
      'y' in data) {

    const station = dataValidator.stationDataProcessor(data)

    if (station.validation === 'invalid') {
      console.log('Station data is invalid!')
      return station
    }
    console.log('station data is valid * ',station.stationRawData)
    return station
  }

  console.log('the csvFile is not in right format')

  return { error: 'the csvFile is not in right format' }
}

module.exports = processData