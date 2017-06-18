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

const seashellActionMiddleware = (allActionCreators) => async ctx => {
  const sendError = (error) => {
    ctx.response.body = {error}
    ctx.response.end()
  };
  const paths = ctx.request.headers.originUrl.split('/').filter(item => item !== '')
  const walk = async (currentActionCreators) => {
    if (paths.length === 0) return sendError('NOT_FOUND');
    const currentAction = currentActionCreators[paths.shift()];
    if (typeof currentAction === 'undefined') return sendError('NOT_FOUND');
    if (typeof currentAction === 'object' ) {
      return process.nextTick(() => walk(currentAction))
    }
    if (typeof currentAction === 'function') {
      if (paths.length > 0) return sendError('NOT_FOUND');
      const dispatch = createDispatch(ctx);
      const actionType = dispatch(currentAction(ctx.request.body));
      if (actionType instanceof Promise) {
        try {
          ctx.response.body = await actionType;
          ctx.response.end()
        } catch(e){
          sendError(e);
        }
      }
      return null;
    }
    return sendError('ERROR_TYPE_OF_ACTION')
  }
  process.nextTick(() => walk(allActionCreators))
}

export {
  createDispatch,
  bindActionCreators,
  seashellActionMiddleware
}
