import { pEvent } from 'p-event'

// TODO: replace with `once()` after dropping support for Node <15
export const waitForEvents = async (eventEmitter, signals, cancelSignal) => {
  const promise = pEvent(eventEmitter, signals)
  cancelSignal.addEventListener('abort', promise.cancel)
  await promise
}
