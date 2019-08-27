import { ensureCurrentInstance, currentInstance } from './currentInstance'

export function useParams(){
  ensureCurrentInstance()
  const { req } = this
  
}