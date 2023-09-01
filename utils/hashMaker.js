const crypto = require('crypto')

const hashRecord = (record) => {
  const hash = crypto.createHash('md5')
  hash.update(JSON.stringify(record))
  return hash.digest('hex')
}

module.exports = {
  hashRecord
}