const { createStore } = require('../src')

const testReducer = (state, action) => {
  if (action.type === 'test/add') return {
    count: state.count + 1
  }
  if (action.type === 'test/minus') return {
    count: state.count - 1
  }
  return state
}

const test2Reducer = (state, action) => {
  if (action.type === 'test2/add') return {
    count: state.count + 1
  }
  if (action.type === 'test2/minus') return {
    count: state.count - 1
  }
  return state
}

Array.from({length: 1000}, (v, k) => {

  console.time('createStore')
  const store = createStore({
    test: testReducer,
    test2: test2Reducer,
  }, {
    test: { count: 1 },
    test2: { count: 1 }
  })

  // console.log(store.getState())
  console.timeEnd('createStore')

  console.time('test/add')

  store.dispatch({
    type: 'test/add'
  })

  // console.log(store.getState())
  console.timeEnd('test/add')

  console.time('test2/minus')

  store.dispatch({
    type: 'test2/minus'
  })

  // console.log(store.getState())
  console.timeEnd('test2/minus')
})
