const morgan = require('morgan')
const express = require('express')
const lois = require('../../lib')

const lex = lois.express

class User {
  reducer(state, action) {
    return state
  }

  _next(query) {
    return async (dispatch, getState) => {
      return lois.symbols.NextSymbol
    }
  }

  _get(query) {
    return async (dispatch, getState) => {
      return {
        query: query
      }
    }
  }

  _ignore(query) {
    return async (dispatch, getState) => {
      const { response: res } = getState()
      res.write(JSON.stringify({ ignore: query }))
      res.end()
      return lois.symbols.IgnoreSymbol
    }
  }
}


const user = new User()

const app = express()

app.use(morgan('dev'))
app.use(lex.createStore())
app.use('/user', lex.register('user', user))
app.use('/user/:userId', ...lex.transform(user._next))
app.get('/user/:userId', ...lex.transform(user._get))
app.get('/user/:userId/ignore', ...lex.transform(user._ignore, user._get))

app.listen(10723, () => console.log('port 10723'))
