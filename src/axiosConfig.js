var axios = require('axios')

const httpClient = axios.create({withCredential: true})

module.exports = {
  httpClient
}