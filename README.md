# action-creator
A simple way to write function with context dependencies without context parameter

---
[中文](./README_CN.md)


## Get started

### install

```
npm install action-creator
# or
yarn add action-creator
```

### usage

```javascript
import {bindActionCreators, connect} from 'action-creator'
```



## Docs

### 1. bindActionCreators(object: actionCreators)(ctx) => function: actions

Param `actionCreators` is a object contain `action creators`, like:

```javascript
bindActionCreators({
  getIp: () => {},
  getUserName: () => {},
})

```

it will return a function, and then pass param `ctx` to this function. like:

```javascript
const ctx = {
  req: {},
  res: {}
}

bindActionCreators({
  getIp: () => {},
  getUserName: () => {},
})(ctx)
```

it will return a object contains `{getIp, getUserName}`, now you can use `getIp` directly.


### 2. connect(function: bindActionCreators(actionCreators))(beConnected) => function: wrappedActionCreator

An action is written like `(..args) => (ctx, getAction) => {...}`, so if you want to use `getAction` method,
you must `connect` it with other actions you need. like:

```javascript

const getName = (...args) => (ctx, getAction) => {
  const {getParentName} = getAction()
  return getParentName(...args) + args[1]
}
// ... after do bindActionCreators(...)(ctx), you run getName() will
// cause an Error 'getParentName is not a function'

const connectedGetName = connect(
  bindActionCreators({
    getParentName
  })
)
// this will be ok

```

## License

MIT
