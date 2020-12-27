import process from 'process'

import now from 'precise-now'

import { UserError } from '../error/main.js'
import { setPriorityDescription } from '../progress/set.js'

// Allow users to stop measuring by using signals like SIGINT (CTRL-C).
// When this happens, combinations still properly end and exit.
// The user can hit the same signal twice to abort immediately instead.
export const addStopHandler = function (progressState) {
  const stopState = {}
  const { handlers, onAbort } = createHandlers({ stopState, progressState })
  const removeStopHandler = removeHandlers.bind(undefined, handlers)
  return { stopState, onAbort, removeStopHandler }
}

// Signals usually done interactively by user in terminals, cross-platform.
// We allow non-interactive signals sending too for programmatic usage.
const STOP_SIGNALS = ['SIGINT', 'SIGBREAK', 'SIGHUP', 'SIGTERM']

// Create signal handlers
const createHandlers = function ({ stopState, progressState }) {
  // eslint-disable-next-line fp/no-let
  let handlers = []
  // eslint-disable-next-line promise/avoid-new
  const onAbort = new Promise((resolve, reject) => {
    // eslint-disable-next-line fp/no-mutation
    handlers = STOP_SIGNALS.map((signal) =>
      createHandler({ signal, stopState, progressState, reject }),
    )
  })
  return { handlers, onAbort }
}

// We create a copy of `handleStop()` so that `removeStopHandler()` is scoped
// to the current benchmark even if `bench()` is called programmatically
// several times in parallel
const createHandler = function ({ signal, stopState, progressState, reject }) {
  const handleStopCopy = handleStop.bind(undefined, {
    stopState,
    progressState,
    reject,
  })
  process.on(signal, handleStopCopy)
  return { signal, handleStopCopy }
}

const handleStop = function ({ stopState, progressState, reject }) {
  if (stopState.stopped !== undefined) {
    abortBenchmark(stopState, reject)
    return
  }

  setPriorityDescription(progressState, STOP_DESCRIPTION)
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  stopState.stopped = now()
}

const STOP_DESCRIPTION = 'Stopping...'

const abortBenchmark = function (stopState, reject) {
  if (isEarlyAbort(stopState)) {
    return
  }

  const error = new UserError('Benchmark has been aborted')
  reject(error)
}

// Users must wait 5 seconds before being able to abort.
// This promotes proper cleanup.
// Also, this prevents misuse due to users mistakenly hitting the keys twice.
const isEarlyAbort = function ({ stopped }) {
  return stopped + ABORT_DELAY > now()
}

const ABORT_DELAY = 5e9

const removeHandlers = function (handlers) {
  handlers.forEach(removeHandler)
}

const removeHandler = function ({ signal, handleStopCopy }) {
  process.off(signal, handleStopCopy)
}
