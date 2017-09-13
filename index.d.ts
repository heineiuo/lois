export function createStore(reducers: { function }, defaultState: { any }, middleware): {
  dispatch,
  getState
}

export function pathsToActiosn(store, paths, params, currentActionCreators, onSuccess, onError): any
