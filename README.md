# lois
Inspired by [redux](https://github.com/reactjs/redux), lois a web framework to write **predictable state data-flow** web service.

---
[中文文档](./README_CN.md)


## Get started

### install

```bash
$ npm install lois
```

### 

### Example

```javascript

const morgan = require('morgan')
const express = require('express')
const lois = require('lois')

const lex = lois.express
const symbols = lois.symbols

class User {
  reducer(state, action) {
    return state
  }

  _next(query) {
    return async (dispatch, getState) => {
      return symbols.NextSymbol
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
      return symbols.IgnoreSymbol
    }
  }
}


const user = new User()

const app = express()

app.use(morgan('dev'))
app.use(lex.createStore())
app.use('/user', lex.register('user', {}, user))
app.use('/user/:userId', ...lex.transform(user._next))
app.get('/user/:userId', ...lex.transform(user._get))
app.get('/user/:userId/ignore', ...lex.transform(user._ignore, user._get))

app.listen(10723, () => console.log('running on port 10723'))

```


## Documents

### lois.express.createStore

### lois.express.transform

### lois.express.register

### lois.symbols.NextSymbol

### lois.symbols.IgnoreSymbol



## License

MIT
