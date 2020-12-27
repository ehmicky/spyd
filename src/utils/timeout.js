import AbortController from 'abort-controller'
import delay from 'delay'
import pEvent from 'p-event'

// TODO: replace with `timers` after dropping support for Node <15
export const createController = function () {
  const controller = new AbortController()
  return {
    abortSignal: controller.signal,
    abort: controller.abort.bind(controller),
  }
}

// TODO: replace with `once()` after dropping support for Node <15
export const waitForEvents = async function (
  eventEmitter,
  signals,
  abortSignal,
) {
  const promise = pEvent(eventEmitter, signals)
  abortSignal.addEventListener('abort', promise.cancel)
  await promise
}

// TODO: replace with `timers/promises` after dropping support for Node <15
export const waitForDelay = async function (duration, abortSignal) {
  await delay(duration, { signal: abortSignal })
}
