const bindActionCreators = (actionCreators, dispatch) => {
  return [{}].concat(Object.entries(actionCreators)).reduce((all, current) => {
    all[current[0]] = (params) => dispatch(current[1])(params)
    return all
  });
};


const createDispatch = (ctx) => (actionCreator) => (params) => {
  return actionCreator(params)(createDispatch(ctx), () => ctx)
}

export {
  createDispatch,
  bindActionCreators
}