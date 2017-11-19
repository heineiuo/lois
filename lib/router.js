const defaultState = {}

const routerReducer = (state = defaultState, action) => {
  return state
}

const Ignore = Symbol()

/**
 * routerGo
 * @param {*} currentActionCreators 
 * @param {*} cb 
 */
const routerGo = (currentActionCreators, cb) => (dispatch, getState) => {
  const paths = getState().request.path.split('/').filter(item => !!item)
  const handleObject = (currentAction, callback = null) => {
    let nextAction
    if (paths.length === 0) {
      if (!currentAction.hasOwnProperty('/')) {
        return cb(new Error('NOT_FOUND'))
      }
      nextAction = currentAction['/']
    } else {
      nextAction = currentAction[paths.shift()]
    }
    if (typeof nextAction === 'undefined') {
      if (!currentAction.hasOwnProperty('*')) {
        return cb(new Error('NOT_FOUND'))
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
    return cb(new TypeError(`ERROR_TYPE_OF_ACTION: typeof currentActionCreators is ${typeof currentActionCreators}`))
  }

  const handleList = (list) => {
    if (list.length === 0) {
      return cb(new Error('NOT_FOUND'))
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
      return cb(new Error('ERROR_TYPE_OF_ACTION'))
    }
    return walkToSolveList(0)
  }

  /**
   * handleFunction
   * @param {*} currentAction 
   * @param {*} callback if router map is a list, only the last action will 
   *            call `cb` method, other actions can only call `dispatch` to 
   *            mutate state.
   */
  const handleFunction = async (currentAction, callback = null) => {
    if (!callback && paths.length > 0) {
      return cb(new Error('NOT_FOUND'))
    }
    try {
      const actionType = dispatch(currentAction(getState().router.params))
      const actionResult = actionType instanceof Promise ?
        await actionType :
        actionType
      if (callback) return callback()
      /**
       * Do nothing when actionResult is `Ignore`
       * used for call response method like res.write() 
       * by action self.
       */
      if (typeof actionResult === Ignore) {
        return false
      }
      return cb(null, actionResult)
    } catch (e) {
      return cb(e)
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
  return cb(new TypeError(`ERROR_TYPE_OF_ACTION: typeof currentActionCreators is ${typeof currentActionCreators}`))
}

module.exports = module.exports.default = {
  routerGo,
  routerReducer,
  Ignore
}
