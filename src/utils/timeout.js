import delay from 'delay'
import { pEvent } from 'p-event'

// TODO: replace with `timers` after dropping support for Node <15
export const createController = () => {
  const controller = new AbortController()
  return {
    cancelSignal: controller.signal,
    cancel: controller.abort.bind(controller),
  }
}

// TODO: replace with `once()` after dropping support for Node <15
export const waitForEvents = async (eventEmitter, signals, cancelSignal) => {
  const promise = pEvent(eventEmitter, signals)
  cancelSignal.addEventListener('abort', promise.cancel)
  await promise
}

// TODO: replace with `timers/promises` after dropping support for Node <15
export const waitForDelay = async (duration, cancelSignal) => {
  await delay(duration, { signal: cancelSignal })
}
