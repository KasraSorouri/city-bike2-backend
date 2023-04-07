const fileReader = require('express').Router()
const logger = require('../utils/logger')
const multer = require('multer')
const csv = require('csv-parser')
const fs = require('fs')
const processData = require('../utils/processData')

const upload = multer({ dest: 'uploads/' })

fileReader.post('/upload-csv', upload.single('csvFile'), (req, res) => {
  try {
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', async (data) => {
        const result = await processData(data)
        console.log('result -> ',result)
      })
      .on('end', () => {
      // process and save the data to your database here
        fs.unlinkSync(req.file.path)
        res.status(200).json({ message: 'CSV uploaded successfully' })
      })
  } catch (e) {
    logger.error({ error: 'file is missing!' })
    res.status(400).send({ error: 'file is missing!' })
  }

})

module.exports = fileReader