const http = require('http')
const compression = require('compression')({ filter: () => true })
const fs = require('fs')
const { pathsToActions, createStore } = require('../lib')

const noop = () => { }

const compressionAction = () => (dispatch, getState) => {
  const { request, response } = getState()
  compression(request, response, noop)
}

const readFileAction = () => (dispatch, getState) => {
  const { response: res } = getState()
  fs.readFile('./index.js', 'utf8', (err, data) => {
    res.write(data)
    res.end()
  })
}
  
const fooBarAction = () => (dispatch, getState) => ({ foo: 'bar' })

const api = [
  // compressionAction
]

const n = parseInt(process.env.MW || '1', 10)
const useAsync = process.env.USE_ASYNC === 'true'
console.log(`  ${n}${useAsync ? ' async' : ''} routes`)

Array.from({ length: n }, (v, k) => {
  if (useAsync) {
    api.push(() => (dispatch, getState) => new Promise(resolve => resolve({ k })))
  } else {
    api.push(() => (dispatch, getState) => ({ k }))
  }
})

api.push(
  fooBarAction
)

const reducers = {
  request: (state = {}) => state,
  response: (state = {}) => state,
  params: (state = {}) => state
}

const server = http.createServer(function (req, res) {
  const store = createStore(reducers, { request: req, response: res })
  const onSuccess = (data) => {
    const str = JSON.stringify(data)
    res.end(str)
  }
  const onError = (err) => {
    res.end(err.stack)
  }
  const paths = req.url.split('/').filter(item => item !== '')
  return pathsToActions(store, paths, {}, api, onSuccess, onError)
})

server.listen(3333)
