export let currentInstance = null

export function setCurrentInstance(instance) {
  currentInstance = instance
}

export function ensureCurrentInstance() {
  if (!currentInstance) {
    throw new Error(
      `invalid hooks call.`
    )
  }
}