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
const pathsToActions = async (ctx, paths, currentActionCreators, onSuccess, onError) => {
  if (paths.length === 0) return onError(new Error('NOT_FOUND'));
  const currentAction = currentActionCreators[paths.shift()];
  if (typeof currentAction === 'undefined') return onError(new Error('NOT_FOUND'));
  if (typeof currentAction === 'object' ) {
    return process.nextTick(() => pathsToActions(
      ctx,
      paths,
      currentAction,
      onSuccess,
      onError
    ))
  }
  if (typeof currentAction === 'function') {
    if (paths.length > 0) return onError(new Error('NOT_FOUND'));
    const dispatch = createDispatch(ctx);
    const actionType = dispatch(currentAction(ctx.request.body));
    if (actionType instanceof Promise) {
      try {
        onSuccess(await actionType)
      } catch(e){
        onError(e);
      }
    }
    return null;
  }
  return onError(new Error('ERROR_TYPE_OF_ACTION'))
}

export {
  createDispatch,
  bindActionCreators,
  pathsToActions
}
