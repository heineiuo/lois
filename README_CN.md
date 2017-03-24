# action-creator
编写需要上下文参数的函数，但是可以不传入上下文参数

---


## 开始

### 安装

```
npm install action-creator
# 或者
yarn add action-creator
```

### 使用

```javascript
import {bindActionCreators, connect} from 'action-creator'
```


## 文档

### 1. bindActionCreators(object: actionCreators)(ctx) => function: actions

`actionCreators` 是一个包含了你编写的`action`的对象， `ctx`是你要传递的上下文参数

```javascript
bindActionCreators({
  getIp: () => {},
  getUserName: () => {},
})

```
`bindActionCreators`会返回一个函数，然后你把你的上下文传递给它，得到真正可以调用的`action`函数：

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

现在，你可以直接调用 `{getIp, getUserName}`等函数了


### 2. connect(function: bindActionCreators(actionCreators))(beConnected) => function: wrappedActionCreator

一个`action`的编写方式是： `(..args) => (ctx, getAction) => {...}`, 注意这里的`getAction`, 它会返回你要的其他`action`，
但是你首先得`connect`这个`action`，把你要用到的`action` 传进来：

```javascript

const getName = (...args) => (ctx, getAction) => {
  const {getParentName} = getAction()
  return getParentName(...args) + args[1]
}
// ... 此时如果你调用`bindActionCreators(...)(ctx)`, 再执行`getName`, 会触发
// 'getParentName is not a function'的错误， 你必须像下面这么做

const connectedGetName = connect(
  bindActionCreators({
    getParentName
  })
))(getName)
// 这样你就能在getName里调用getParentName了

```

## License

MIT
