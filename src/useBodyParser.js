import typeIs from 'type-is'
import bodyParser from 'body-parser'
import { ensureCurrentInstance, currentInstance } from './currentInstance'
import { useMethod } from './useMethod'

export function useBodyParser() {
  ensureCurrentInstance()
  const { req } = currentInstance
  if (!typeIs.hasBody(req)) {
    debug('skip empty body')
    next()
    return
  }


  return {
    async json() {

    }
  }
}