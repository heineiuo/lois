const http = require('http')
const { pathsToActions, createStore } = require('../lib')

const api = []

const n = parseInt(process.env.MW || '1', 10)
console.log('  %s routes', n)

Array.from({ length: n }, (v, k) => {
  // api.push(() => (dispatch, getState) => new Promise(resolve => resolve({k})))
  api.push(() => (dispatch, getState) => ({ k }))
})

api.push(
  () => (dispatch, getState) => ({ foo: 'bar' })
)

const reducers = {
  request: (state = {}) => state,
  response: (state = {}) => state,
}

const server = http.createServer(function (req, res) {
  const store = createStore(reducers, { request: req, response: res })
  const onSuccess = (data) => {
    res.end(JSON.stringify(data))
  }
  const onError = (err) => {
    res.end(err.stack)
  }
  const paths = req.url.split('/').filter(item => item !== '')
  return pathsToActions(store, paths, {}, api, onSuccess, onError)
})

server.listen(3333)
