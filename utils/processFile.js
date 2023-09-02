const csv = require('csv-parser')
const fs = require('fs')
const { Transform } = require('stream')

const logger = require('../utils/logger')
const processData = require('../utils/processData')
const Trip = require('../models/trip')
const Station = require('../models/station')
const { stationDataProcess } = require('./stationsTripProcessing')

const processFile = async (csvFile) => {
  return new Promise((resolve, reject) => {

    let results = {
      dataType: '',
      fileRows: 0,
      recordAdded: 0,
      dataInavlid: 0,
      duplicateRecord: 0,
    }

    const buffer = []
    const batchSize = 3000

    const insertBatch = async (data, model) => {
      try {
        await model.insertMany(data, { ordered: false })
        results.recordAdded += data.length
      } catch (err) {
        if (err.code === 11000) {
          results.duplicateRecord++
        }
      }
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
          buffer.push(new Trip(processedData.data))
          if (buffer.length >= batchSize) {
            await insertBatch(buffer, Trip)
            buffer.length = 0
          }
        }

        if (processedData.status === 'valid' && processedData.dataType === 'station') {
          results.dataType = 'station'
          //const station = new Station(processedData.data)
          buffer.push(new Trip(processedData.data))
          if (buffer.length >= batchSize) {
            await insertBatch(buffer, Station)
            buffer.length = 0
          }
        }

        callback()
      },
    })

    const readStream = fs.createReadStream(csvFile)
    readStream.pipe(csv()).pipe(transformStream)

    transformStream.on('finish', async () => {
      // Insert any remaining records in the buffer
      if (buffer.length > 0) {
        await insertBatch(buffer, buffer[0] instanceof Trip ? Trip : Station)
      }

      logger.info(results)
      resolve(results)
      stationDataProcess()
    })
      .on('error', (err) => {
        logger.error(err)
        reject(err)
      })
  })
}

module.exports = processFile
