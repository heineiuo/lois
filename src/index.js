const noop = () => { }

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

/**
 * createStore
 */
const createStore = (reducers, defaultState = {}, middeware = noop) => {

  const reducerNames = Object.keys(reducers)

  let state = reducerNames.reduce((all, reducerName) => {
    all[reducerName] = reducers[reducerName](all[reducerName], { type: 'INIT' })
    return all
  }, defaultState)

  const computeState = (action) => {
    middeware(action)
    reducerNames.forEach(reducerName => {
      state[reducerName] = reducers[reducerName](state[reducerName], action)
    })
    return state
  }

  const getState = () => state

  /**
   * dispatch
   *
   * example:
   * const actionCreatorThunkExample = (params) => (dispatch, getState) => {}
   * dispatch(actionCreatorThunkExample({foo: 'bar'}))
   */
  const dispatch = (actionCreator) => {
    if (typeof actionCreator === 'function') {
      return actionCreator(dispatch, getState)
    }
    return computeState(actionCreator)
  }

  return {
    getState,
    dispatch
  }
}

/**
 * paths to actions
 * @param {*} store 
 * @param {*} paths 
 * @param {*} currentActionCreators 
 * @param {*} onSuccess 
 * @param {*} onError 
 */
const pathsToActions = (store, paths, currentActionCreators, onSuccess, onError) => {
  const handleObject = (currentAction, callback = null) => {
    let nextAction
    if (paths.length === 0) {
      if (!currentAction.hasOwnProperty('/')) {
        return onError(new Error('NOT_FOUND'))
      }
      nextAction = currentAction['/']
    } else {
      nextAction = currentAction[paths.shift()]
    }
    if (typeof nextAction === 'undefined') {
      if (!currentAction.hasOwnProperty('*')) {
        return onError(new Error('NOT_FOUND'))
      }
      nextAction = currentAction['*']
    }
    if (typeof nextAction === 'function') {
      return handleFunction(nextAction)
    }
    if (nextAction instanceof Array) {
      return handleList(nextAction)
    }
    if (typeof nextAction === 'object') {
      return handleObject(nextAction)
    }
    return onError(new TypeError(`ERROR_TYPE_OF_ACTION: typeof currentActionCreators is ${typeof currentActionCreators}`))
  }

  const handleList = (list) => {
    if (list.length === 0) {
      return onError(new Error('NOT_FOUND'))
    }
    const walkToSolveList = (index) => {
      const current = list[index]
      if (typeof current === 'function') {
        return handleFunction(
          current, 
          (index === list.length - 1) ? 
            '' : 
            result => walkToSolveList(index + 1, result)
        )
      }
      if (current instanceof Array) {
        return handleList(current)
      }
      if (typeof current === 'object') {
        return handleObject(current)
      }
      return onError(new Error('ERROR_TYPE_OF_ACTION'))
    }
    return walkToSolveList(0)
  }

  const handleFunction = async (currentAction, callback = null) => {
    if (!callback && paths.length > 0) {
      return onError(new Error('NOT_FOUND'))
    }
    try {
      const actionType = store.dispatch(currentAction(store.getState().params))
      const actionResult = actionType instanceof Promise ?
        await actionType :
        actionType
      if (callback) return callback()
      if (typeof actionResult === 'undefined') {
        return false
      }
      return onSuccess(actionResult)
    } catch (e) {
      return onError(e)
    }
  }

  if (currentActionCreators instanceof Array) {
    return handleList(currentActionCreators)
  }
  if (typeof currentActionCreators === 'object') {
    return handleObject(currentActionCreators)
  }
  if (typeof currentActionCreators === 'function') {
    return handleFunction(currentActionCreators)
  }
  return onError(new TypeError(`ERROR_TYPE_OF_ACTION: typeof currentActionCreators is ${typeof currentActionCreators}`))
}

module.exports = module.exports.default = {
  createStore,
  bindActionCreator,
  bindActionCreators,
  pathsToActions
}
