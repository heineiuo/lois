import { currentInstance, ensureCurrentInstance } from './currentInstance'

export function useEffect(callback) {
  ensureCurrentInstance()
  process.nextTick(async () => {
    try {
      const result = await callback()

    } catch(e){

    }
  })
}