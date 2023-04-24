const fileReader = require('express').Router()
const fs = require('fs')
const multer = require('multer')

const logger = require('../utils/logger')
const processFile = require('../utils/processFile')

const upload = multer({ dest: 'uploads/' })

fileReader.post('/upload-csv', upload.single('csvFile'), async (req, res) => {
  try {
    const result  = await processFile(req.file.path)
    res.json({ status: 'file uploaded successfully!' , dataType: result })
  } catch (err) {
    logger.error(err)
    res.json({ error: 'server error' }).status(500)
  }
  fs.unlinkSync(req.file.path)
})

module.exports = fileReader