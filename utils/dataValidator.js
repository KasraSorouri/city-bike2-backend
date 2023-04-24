
const isDate = (date) => {
  if (Date.parse(date)) {
    return date
  }
  return 'invalid'
}

const dataExist = (data) => {
  if (data)  {
    return data
  }
  return 'invalid'
}

const isDistanceValid = (data) => {
  if (!Number(data) || Number(data) < 10 ) {
    return 'invalid'
  }
  return Number(data)
}

const isDurarionValid = (data) => {
  if (!Number(data) || Number(data) < 10 ) {
    return 'invalid'
  }
  return Number(data)
}

const tripDataProcessor = (RawData) => {
  let tripRawData = {
    departure: isDate(RawData['﻿Departure']),
    return: isDate(RawData['Return']),
    departureStationId: dataExist(RawData['Departure station id']),
    departureStationName: RawData['Departure station name'],
    returnStationId: dataExist(RawData['Return station id']),
    returnStationName: RawData['Return station name'],
    distance: isDistanceValid(RawData['Covered distance (m)']),
    duration: isDurarionValid(RawData['Duration (sec.)']),
  }

  if( tripRawData.departure === 'invalid'
   || tripRawData.return === 'invalid'
   || tripRawData.departureStationId === 'invalid'
   || tripRawData.returnStationId === 'invalid'
   || tripRawData.distance === 'invalid'
   || tripRawData.duration === 'invalid') {
    return { status:'invalid', tripRawData }
  }

  return { status:'valid', tripRawData }
}

const stationDataProcessor = (RawData) => {
  let stationRawData = {
    stationId: dataExist(RawData['ID']),
    stationName: dataExist(RawData['Name']),
    address: dataExist(RawData['Adress']),
    city: RawData['Kaupunki'],
    operator: RawData['Operaattor'],
    capacity: Number(RawData['Kapasiteet']),
    longtitude: Number(RawData['x']),
    latitude: Number(RawData['y']),
  }

  if( stationRawData.stationId === 'invalid'
   || stationRawData.stationName === 'invalid'
   || stationRawData.address === 'invalid') {

    return { status:'invalid', stationRawData }
  }
  return { status:'valid', stationRawData }
}
module.exports = {
  tripDataProcessor,
  stationDataProcessor
}