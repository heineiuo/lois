const Store = require('./Store')
const { StoreSymbol, IgnoreSymbol, NextSymbol, QuerySymbol } = require('./symbols')

const reducer = (state, action) => {
  return state
}

const register = (moduleName, defaultState, model) => {
  return (req, res, next) => {
    const store = res.locals[StoreSymbol]
    store.register(moduleName, defaultState, model)
    next()
  }
}

const createStore = (middleware) => {
  return (req, res, next) => {
    const store = new Store(middleware)
    res.locals[StoreSymbol] = store
    store.register('request', req, { reducer })
    store.register('response', res, { reducer })
    return next()
  }
}

const transform = (...ActionCreators) => {
  const router = []
  let index = 0
  let totalIndex = ActionCreators.length - 1
  while (index <= totalIndex) {
    let currentIndex = index
    let ActionCreator = ActionCreators[currentIndex]
    let shouldNext = currentIndex != totalIndex
    router.push(async (req, res, next) => {
      const store = res.locals[StoreSymbol]
      if (currentIndex === 0) {
        res.locals[QuerySymbol] = Object.assign({}, req.body, req.query, req.params)
      }
      const query = res.locals[QuerySymbol]
      try {
        const result = await store.dispatch(ActionCreator(query))
        if (result === IgnoreSymbol) return
        if ((result === NextSymbol) || shouldNext) return next()
        if (!res.headersSent) {
          return res.json(result)
        }
      } catch (e) {
        next(e)
      }
    })
    index++
  }
  return router
}

module.exports = module.exports.default = {
  createStore,
  transform,
  register
}
