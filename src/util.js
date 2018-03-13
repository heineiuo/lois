
const bindActionCreator = (actionCreator, dispatch) => {
  return (...params) => dispatch(actionCreator(...params))
}

const bindActionCreators = (actionCreators, dispatch) => {
  if (typeof actionCreators !== 'object') throw new TypeError('actionCreators must be object')
  return Object.keys(actionCreators).reduce((all, actionCreatorName) => {
    const actionCreator = actionCreators[actionCreatorName]
    if (typeof actionCreator === 'function') {
      all[actionCreatorName] = bindActionCreator(actionCreator, dispatch)
    } else {
      all[actionCreatorName] = bindActionCreators(actionCreator, dispatch)
    }
    return all
  }, {})
}

module.exports = module.exports.default = {
  bindActionCreator,
  bindActionCreators
}
