const bindActionCreators = (actionCreators) => {
  return (ctx) => {
    const p = {};
    Object.keys(actionCreators).forEach(actionCreatorName => {
      const actionCreator = actionCreators[actionCreatorName];
      const getActions = () => {};
      p[actionCreatorName] = (params) => actionCreator(params)(ctx, getActions)
    });
    return p
  }

};

const connect = (creators) => (main) => (...args) => (ctx, getActions) => {
  getActions = () => creators(ctx);
  return main(...args)(ctx, getActions)
};

export {
  connect,
  bindActionCreators
}