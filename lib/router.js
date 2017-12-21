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
    let nextPath
    if (paths.length === 0) {
      if ('/' in currentAction) {
        nextPath = '/'
      } else if ('*' in currentAction) {
        nextPath = '*'
      } else {
        return cb(new Error('NOT_FOUND'))
      }
    } else {
      nextPath = paths.shift()
    }
    let nextAction = currentAction[nextPath]
    if (typeof nextAction === 'undefined') {
      if ('*' in currentAction) {
        nextPath = '*'
        nextAction = currentAction['*']
      } else {
        return cb(new Error('NOT_FOUND'))
      }
    }
    if (typeof nextAction === 'function') {
      return handleFunction(nextAction, null, nextPath)
    }
    if (nextAction instanceof Array) {
      return handleList(nextAction)
    }
    if (typeof nextAction === 'object') {
      return handleObject(nextAction)
    }
    return cb(new TypeError(`ERROR_TYPE_OF_ACTION: typeof currentActionCreators is ${typeof currentActionCreators}`))
  }

  const walkToSolveList = (list, index=0) => {
    const current = list[index]
    if (typeof current === 'function') {
      return handleFunction(
        current, 
        (index === list.length - 1) ? 
          null : 
          result => walkToSolveList(list, index + 1, result)
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

  const handleList = (list) => {
    if (list.length === 0) {
      return cb(new Error('NOT_FOUND'))
    }
    return walkToSolveList(list)
  }

  /**
   * handleFunction
   * @param {*} currentAction 
   * @param {*} callback if router map is a list, only the last action will 
   *            call `cb` method, other actions can only call `dispatch` to 
   *            mutate state.
   */
  const handleFunction = async (currentAction, callback = null, nextPath) => {
    if (!callback && paths.length > 0 && !(nextPath === '*')) {
      return cb(new Error('NOT_FOUND'))
    }
    try {
      const actionType = dispatch(currentAction(getState().router.params))
      const actionResult = actionType instanceof Promise ?
        await actionType :
        actionType
      /**
       * Do nothing when actionResult is `Ignore`
       * used for call response method like res.write() 
       * by action self.
       */
      if (actionResult === Ignore) return false
      if (callback) return callback()
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
    return handleFunction(currentActionCreators, null)
  }
  return cb(new TypeError(`ERROR_TYPE_OF_ACTION: typeof currentActionCreators is ${typeof currentActionCreators}`))
}

module.exports = module.exports.default = {
  routerGo,
  routerReducer,
  Ignore
}
