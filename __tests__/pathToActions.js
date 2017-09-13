import {
  createDispatch,
  bindActionCreators,
  pathsToActions
} from '../src'


const currentActionCreators = {
  'about': {
    '/': query => (dispatch, getCtx) => new Promise(resolve => resolve({message: 'about'})),
    "plain": query => (dispatch, getCtx) => ({message: 'plain'})
  }
}

const ctx = {
  request: {},
  response: {}
}

// pathsToActions(
//   ctx, 
//   ['about'], 
//   currentActionCreators, 
//   console.log, 
//   console.error
// )


pathsToActions(
  ctx, 
  ['about', 'plain'], 
  currentActionCreators, 
  console.log, 
  console.error
)
