import compression from 'compression'
import bodyParser from 'body-parser'
import morgan from 'morgan'
import defaults from 'lodash/defaults'
import { createRequestHandler } from 'express-unpkg'
import { Database, aql } from 'arangojs'
import url from 'url'
import { createStore, pathsToActions } from './index'


const noop = () => { }
const compressionMiddleware = compression()
const morganMiddleware = morgan('dev')
const bodyParserMiddleware = bodyParser.json()

export const reducers = {
  db: (state = db) => state,
  session: sessionReducer,
  request: (state, action) => {
    if (action.type === '@@request/ADD_QUERY') {
      return Object.assign(state, action.payload)
      return state
    }
    return state
  },
  params: (state, action) => {
    if (action.type === '@@params/UPDATE') {
      return Object.assign({}, state, action.payload)
    }
    return state
  },
  response: (state) => state,
}

export const actions = {
  api: [
    composedAction,
    bodyParserAction,
    session,
    {
      graph: {
        query: require('./graph/query').default,
        patch: require('./graph/patch').default,
        batch: require('./graph/batch').default,
        log: require('./graph/log').default,
        rollback: require('./graph/rollback').default,
        pullEmptyNodes: require('./graph/pullEmptyNodes').default,
        shareNodeToUser: require('./graph/shareNodeToUser').default
      },
      user: {
        session,
        login: require('./user/login').default,
        register: require('./user/register').default,
        'reset-password': require('./user/resetPassword').default,
        fetchUsersByEmails: require('./user/fetchUsersByEmails').default,
        fetchUsersByIds: require('./user/fetchUsersByIds').default,
      },
      admin: {
        updateIndexHtml: require('./admin/updateIndexHtml').default
      },
      details: {
        getUploadToken: require('./details/getUploadToken').default
      }
    },
  ],
  npm: {
    "*": npmAction
  }
}


const onErrorCreator = (res) => (err) => {
  if (NODE_ENV === 'development') {
    console.log(err)
  }
  let error = {
    error: err.name,
    status: 403,
    message: err.message
  }

  match(error.error, {
    [when('ValidationError')]: () => {
      error.errors = err.details
    },
    [when('TypeError')]: () => {
      error.error = 'ServerError'
      error.message = 'Server error'
      error.status = 503
    },
    [when()]: () => {
      match(error.message, {
        [when('NOT_FOUND')]: () => {
          error.error = 'NotFoundError'
          error.status = 404
        },
        [when()]: () => {
          if (NODE_ENV === 'production') console.log(err.name + err.message)
        }
      })
    }
  })

  // res.status(error.status)
  res.end(JSON.stringify(error))
}

class App {
  
}


export const requestListener = (req, res) => {
  if (process.env.NODE_ENV === 'development') {
    // res.setHeader("Access-Control-Allow-Origin", req.headers.origin)
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept")
  }
  if (req.method === 'OPTIONS') {
    res.setHeader("Access-Control-Allow-Credentials", false)
    res.setHeader("Access-Control-Max-Age", '86400')
    return res.end()
  }

  const store = createStore(reducers, { request: req, response: res})
  
  const parsedurl = url.parse(`http://${req.headers.host}${req.url}`, true)
  store.dispatch({
    type: '@@request/ADD_QUERY',
    payload: {
      query: parsedurl.query
    }
  })
  const onSuccess = (data) => {
    defaults(data, { status: 200 })
    res.end(JSON.stringify(data))
  }
  const onError = onErrorCreator(res)
  const paths = parsedurl.pathname.split('/').filter(item => item !== '')
  pathsToActions(store, paths, actions, onSuccess, onError)
}
