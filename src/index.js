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

export {
  createDispatch,
  bindActionCreators
}