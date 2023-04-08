
const csv = require('csv-parser')
const fs = require('fs')

const logger = require('../utils/logger')
const processData = require('../utils/processData')
const Trip = require('../models/trip')
const Station = require('../models/station')

const processFile = async(csvFile) => {
  let results = {
    dataType: '',
    fileRows : 0,
    recordAdded : 0,
    dataInavlid : 0,
    duplicateRecord: 0,
  }
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFile)
      .pipe(csv())
      .on('data', async (data) => {
        results.fileRows++
        const processedData = processData(data)
        if (processedData.status === 'invalid') {
          results.dataInavlid ++
          return
        }
        if (processedData.status === 'valid' && processedData.dataType === 'trip') {
          results.dataType = 'trip'
          const trip = new Trip (processedData.data)
          try {
            await trip.save()
            results.recordAdded++
          } catch (err) {
            if (err.code !== 11000 ) {
              logger.error(err)
            }
            results.duplicateRecord++
          }
        }

        if (processedData.status === 'valid' && processedData.dataType === 'station') {
          results.dataType = 'station'
          const station = new Station (processedData.data)
          try {
            await station.save()
            results.recordAdded++
          } catch (err) {
            if (err.code !== 11000 ) {
              logger.error(err)
            }
            results.duplicateRecord++
          }
        }
      })
      .on('end', () => {
        resolve(results)
      })
      .on('error',(err) => {
        console.log(err)
        reject(err)
      })
  })
}

module.exports = processFile