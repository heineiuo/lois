const bindActionCreators = (actionCreators) => {
  return (ctx) => {
    return [{}].concat(Object.entries(actionCreators)).reduce((p, cur) => {
      p[cur[0]] = (params) => cur[1](params)(ctx, () => {});
      return p
    });
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