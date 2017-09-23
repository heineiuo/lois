# lois (音译罗伊丝，法语中 「法律 」 的意思)
受[redux](https://github.com/reactjs/redux)启发，采用 「 可预测数据流 」 架构编写web服务的框架。

---

## 概述



## 快速上手

### 安装

```bash
$ npm install lois
```

### 一个例子

```javascript
import { createStore, routerReducer, paramsReducer, requestReducer, responseReducer, paramsParse, routerReducer, routerGo } from 'lois'
import http from 'http'

const helloworld = () => (dispatch, getState) => {
  return {
    hello: 'world'
  }
}

http.createServer((req, res) => {
  try {
    const store = createStore({
      request: requestReducer,
      response: responseReducer,
      params: paramsReducer,
      router: routerReducer
    }, {
      request: req,
      response: res,
      params: {},
      router: {}
    })

    store.dispatch(paramsParse())
    store.dispatch(routerGo({
      *: helloworld
    }))

  } catch(e){
    res.end(e.stack)
  }
}).listen('8080', 'Lois running on port 8080')

```


## 文档

### 目录
* createStore
* bindActionCreators
* requestReducer
* responseReducer
* routerReducer
* routerGo
* paramsParse
* paramsReducer

### createStore

### bindActionCreators(actionCreators: object) => binded: object

`actionCreators` 是一个包含了你编写的`action`的对象

```javascript
const binded = bindActionCreators({
  getIp: () => {},
  getUserName: () => {},
})

现在，你可以直接调用 `binded.getIp()`, `binded.getUserName()`等函数了


### requestReducer
### responseReducer
### routerReducer
### routerGo
### paramsParse
### paramsReducer



## License

MIT
