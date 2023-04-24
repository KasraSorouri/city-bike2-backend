const csv = require('csv-parser')
const fs = require('fs')
const { Transform } = require('stream')

const logger = require('../utils/logger')
const processData = require('../utils/processData')
const Trip = require('../models/trip')
const Station = require('../models/station')

const processFile = async (csvFile) => {
  return new Promise((resolve, reject) => {

    let results = {
      dataType: '',
      fileRows: 0,
      recordAdded: 0,
      dataInavlid: 0,
      duplicateRecord: 0,
    }

    // Read and Process Data from the file
    const transformStream = new Transform({
      objectMode: true,
      highWaterMark: 64 *1024,
      transform: async (data, encoding, callback) => {
        results.fileRows++
        const processedData = processData(data)
        if (processedData.status === 'invalid') {
          results.dataInavlid++
          callback()
          return
        }
        if (processedData.status === 'valid' && processedData.dataType === 'trip') {
          results.dataType = 'trip'
          const trip = new Trip(processedData.data)
          try {
            await trip.save()
            results.recordAdded++
          } catch (err) {
            if (err.code === 11000) {
              results.duplicateRecord++
            }
          }
        }

        if (processedData.status === 'valid' && processedData.dataType === 'station') {
          results.dataType = 'station'
          const station = new Station(processedData.data)
          try {
            await station.save()
            results.recordAdded++
          } catch (err) {
            if (err.code === 11000) {
              results.duplicateRecord++
            }
          }
        }
        callback()
      },
    })

    const readStream = fs.createReadStream(csvFile)
    readStream.pipe(csv()).pipe(transformStream)

    transformStream.on('finish', () => {
      logger.info(results)
      resolve(results)
    })
      .on('error', (err) => {
        logger.error(err)
        reject(err)
      })
  })
}

module.exports = processFile
