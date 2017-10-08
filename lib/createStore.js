const noop = () => { }

/**
 * createStore
 */
const createStore = (reducers, defaultState = {}, middeware = noop) => {
  
    const reducerNames = Object.keys(reducers)
    
    const state = reducerNames.reduce((all, reducerName) => {
      all[reducerName] = reducers[reducerName](all[reducerName], { type: 'INIT' })
      return all
    }, defaultState)
  
    const computeState = (action) => {
      middeware(action, state)
      reducerNames.forEach(reducerName => {
        state[reducerName] = reducers[reducerName](state[reducerName], action)
      })
      return state
    }
  
    const getState = () => state
  
    /**
     * dispatch
     *
     * example:
     * const actionCreatorThunkExample = (params) => (dispatch, getState) => {}
     * dispatch(actionCreatorThunkExample({foo: 'bar'}))
     */
    const dispatch = (actionCreator) => {
      if (typeof actionCreator === 'function') {
        return actionCreator(dispatch, getState)
      }
      return computeState(actionCreator)
    }
  
    return {
      getState,
      dispatch
    }
  }

  module.exports = module.exports.default = createStore
