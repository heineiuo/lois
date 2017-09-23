# lois
Inspired by [redux](https://github.com/reactjs/redux), lois a web framework to write **predictable state data-flow** web service.

---
[中文文档](./README_CN.md)


## Get started

### install

```bash
$ npm install lois
```

### 

### Example

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




## Docs
..TODO

## License

MIT
