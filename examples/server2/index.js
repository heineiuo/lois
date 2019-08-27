const http = require('http')
const { useRequest, createListener } = require('../../dist')

async function runner() {
  const req = useRequest()
  // await new Promise(resolve => {
  //   setTimeout(
  //     resolve, 
  //     Math.random() * 5000
  //   )
  // })
  return req.url
}

const listener = createListener({
  runner
})

http
.createServer(listener.listen)
.listen(process.env.PORT || 11001)