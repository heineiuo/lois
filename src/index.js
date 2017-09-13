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
 * @param {*} params // default: store.getState().request.body
 * @param {*} currentActionCreators 
 * @param {*} onSuccess 
 * @param {*} onError 
 */
const pathsToActions = (store, paths, params, currentActionCreators, onSuccess, onError) => {
  const handleObject = (currentAction, callback = null) => {
    if (currentAction instanceof Array) return handleList(currentAction)
    if (paths.length === 0) {
      if (currentAction['/']) {
        return pathsToActions(
          store,
          paths,
          params,
          currentAction['/'],
          onSuccess,
          onError
        )
      }
      // TODO support path-to-regexp
      return onError(new Error('NOT_FOUND'))
    }
    const nextAction = currentAction[paths.shift()]
    return pathsToActions(
      store,
      paths,
      params,
      nextAction,
      onSuccess,
      onError
    )
  }

  const handleList = (list) => {
    if (list.length === 0) return onError(new Error('NOT_FOUND'))
    const walkToSolveList = (index, prevResult) => {
      if (list.length === index) return onSuccess(prevResult)
      const current = list[index]
      if (typeof current === 'function') return handleFunction(current, result => walkToSolveList(index + 1, result))
      if (typeof current === 'object') return handleObject(current)
      return onError(new Error('ERROR_TYPE_OF_ACTION'))
    }
    return walkToSolveList(0)
  }

  const handleFunction = async (currentAction, callback = null) => {
    if (!callback && paths.length > 0) return onError(new Error('NOT_FOUND'))
    let actionType = null
    try {
      actionType = store.dispatch(currentAction(params))
    } catch (e) {
      return onError(e)
    }
    if (actionType instanceof Promise) {
      try {
        const result = await actionType
        if (!callback) return onSuccess(result)
        callback(result)
      } catch (e) {
        onError(e)
      }
    } else if (!!actionType) {
      onSuccess(actionType)
    }
    return null
  }

  if (typeof currentActionCreators === 'object') return handleObject(currentActionCreators)
  if (typeof currentActionCreators === 'function') return handleFunction(currentActionCreators)
  if (typeof currentActionCreators === 'undefined') return onError(new Error('NOT_FOUND'))

  return onError(new Error('ERROR_TYPE_OF_ACTION'))
}

export {
  createStore,
  bindActionCreator,
  bindActionCreators,
  pathsToActions
}
