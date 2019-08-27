import { currentInstance, ensureCurrentInstance } from './currentInstance'

export function useRequest (){
  ensureCurrentInstance()
  return currentInstance.req
}