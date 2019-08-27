import { ensureCurrentInstance, setCurrentInstance } from './currentInstance'
import { useRequest } from './useRequest'

/**
 * 
 * @param {string} matchMethod 
 * @returns {boolean|string}
 */
export function useMethod(needMethod){
  ensureCurrentInstance()
  const req = useRequest()
  return needMethod ? req.method.toUpperCase() : req.method === needMethod
}