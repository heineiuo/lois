import {
  createDispatch,
  bindActionCreators,
  pathsToActions
} from '../src'


const currentActionCreators = {
  'about': {
    '/': query => (dispatch, getCtx) => new Promise(resolve => resolve({message: 'about'}))
  }
}

const ctx = {
  request: {},
  response: {}
}

pathsToActions(
  ctx, 
  ['about'], 
  currentActionCreators, 
  console.log, 
  console.error
)
