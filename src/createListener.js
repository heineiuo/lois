import { setCurrentInstance, ensureCurrentInstance } from './currentInstance'

export function createListener(options) {
  function getRunner() {
    return options.runner
  }

  return {
    async listen(req, res) {
      console.log(req.url)

      try {
        setCurrentInstance(this)
        this.req = req
        const runner = getRunner()
        const result = await runner()
        res.write(result)
      } catch(e){
        res.write(e.stack)
      }
     
      res.end()
    }
  }
}