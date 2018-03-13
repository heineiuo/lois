const noop = () => { }

class Store {
  constructor(middleware = noop) {

    this._reducerNames = []
    this._state = {}
    this._middleware = middleware

    this.register = this.register.bind(this)
    this.getState = this.getState.bind(this)
    this.dispatch = this.dispatch.bind(this)

    return this

  }

  getState() {
    return this._state
  }


  /**
   * dispatch
   *
   * example:
   * const actionCreatorThunkExample = (params) => (dispatch, getState) => {}
   * dispatch(actionCreatorThunkExample({foo: 'bar'}))
   */
  dispatch(actionCreator) {
    if (typeof actionCreator === 'function') {
      return actionCreator(this.dispatch, this.getState)
    }

    this._middleware(actionCreator, this._state)
    this._reducerNames.forEach(reducerName => {
      this._state[reducerName] = this._reducers[reducerName](
        this._state[reducerName],
        actionCreator
      )
    })
    return this._state
  }

  register(modelName, model, defaultState) {
    this._reducerNames.push(modelName)
    const { reducer } = model
    if (!reducer) throw new Error('reducer not exist')
    this._state[modelName] = reducer(defaultState, { type: 'INIT' })
    this._reducers = {
      ...this._reducers,
      [modelName]: reducer,
    }
  }
}

module.exports = module.exports.default = Store
