const dataAnalysisRouter = require('express').Router()

const dataEngineering = require('../utils/stationsTripProcessing')



dataAnalysisRouter.post('/', async (req, res) => {
  const response = await dataEngineering.stationDataProcess()
  if (response) {
    return res.status(200).send(response)
  }
})

dataAnalysisRouter.get('/:id', async (req, res) => {
  const stationId = req.params.id
  const response = await dataEngineering.getProcessedData(stationId)
  if (response) {
    return res.status(200).send(response)
  }
})

module.exports = dataAnalysisRouter
