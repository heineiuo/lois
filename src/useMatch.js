import { ensureCurrentInstance, currentInstance } from './currentInstance'

export function useMatch() {
  ensureCurrentInstance()
  const { req } = this

}