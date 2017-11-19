const createStore = require('./createStore')
const { routerGo, routerReducer, Ignore } = require('./router')
const { requestReducer } = require('./request')
const { responseReducer } = require('./response')
const { bindActionCreator, bindActionCreators } = require('./util')

module.exports = module.exports.default = {
  Ignore,
  createStore,
  bindActionCreator,
  bindActionCreators,
  routerGo,
  routerReducer,
  requestReducer,
  responseReducer
}

