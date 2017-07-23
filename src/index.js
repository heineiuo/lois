const bindActionCreators = (actionCreators, dispatch) => {
  return [{}].concat(Object.entries(actionCreators)).reduce((all, current) => {
    all[current[0]] = (...params) => dispatch(current[1](...params))
    return all
  });
};


/**
 * createDispatch
 *
 * example:
 * const actionCreatorThunkExample = (params) => (dispatch, getCtx) => {}
 * const dispatch = createDispatch({myNameIs: 'ctx'})
 * dispatch(actionCreatorThunkExample({foo: 'bar'}))
 */
const createDispatch = (ctx) => (actionCreator) => {
  return actionCreator(createDispatch(ctx), () => ctx)
}


/**
 * paths to actions
 * @param {*} ctx 
 * @param {*} paths 
 * @param {*} currentActionCreators 
 * @param {*} onSuccess 
 * @param {*} onError 
 */
const pathsToActions = (ctx, paths, currentActionCreators, onSuccess, onError) => {
  const handleObject = (currentAction, callback=null) => {
    if (currentAction instanceof Array) return handleList(currentAction.slice())
    if (paths.length === 0) {
      if (currentAction['/']){
        return pathsToActions(
          ctx,
          paths,
          currentAction['/'],
          onSuccess,
          onError
        )
      }
      // TODO support path-to-regexp
      return onError(new Error('NOT_FOUND'));
    }
    const nextAction = currentAction[paths.shift()]
    return pathsToActions(
      ctx,
      paths,
      nextAction,
      onSuccess,
      onError
    )
  }

  const handleList = (list) => {
    if (list.length === 0) return onError(new Error('NOT_FOUND'))
    const walkToSolveList = (list, prevResult) => {
      if (list.length === 0) return onSuccess(prevResult)
      const current = list.shift()
      if (typeof current === 'function') return handleFunction(current, (result) => walkToSolveList(list, result))
      if (typeof current === 'object') return handleObject(current)
      return onError(new Error('ERROR_TYPE_OF_ACTION'))
    }
    return walkToSolveList(list)
  }

  const handleFunction = async (currentAction, callback=null) => {
    if (!callback && paths.length > 0) return onError(new Error('NOT_FOUND'));
    const dispatch = createDispatch(ctx);
    const actionType = dispatch(currentAction(ctx.request.body));
    if (actionType instanceof Promise) {
      try {
        const result = await actionType
        if (!callback) return onSuccess(result)
        callback(result)
      } catch(e){
        onError(e);
      }
    }
    return null;
  }

  if (typeof currentActionCreators === 'object') return handleObject(currentActionCreators);
  if (typeof currentActionCreators === 'function') return handleFunction(currentActionCreators)
  if (typeof currentActionCreators === 'undefined') return onError(new Error('NOT_FOUND'));
  
  return onError(new Error('ERROR_TYPE_OF_ACTION'))
}

export {
  createDispatch,
  bindActionCreators,
  pathsToActions
}
