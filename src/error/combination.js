// eslint-disable-next-line fp/no-events
import { once } from 'events'

// taskId is `undefined` during init
export const prependTaskPrefix = function (error, { taskId }) {
  if (taskId === undefined) {
    return
  }

  const taskPrefix = `In task "${taskId}"`
  error.message = `${taskPrefix}:\n${error.message}`
}

// Make any stream `error` event throw
export const throwOnStreamError = function (stream) {
  return once(stream, 'dummy_event')
}
