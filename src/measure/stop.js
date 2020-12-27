import process from 'process'

import { UserError } from '../error/main.js'
import { setPriorityDescription } from '../progress/set.js'
import {
  createController,
  waitForEvents,
  waitForDelay,
} from '../utils/timeout.js'

// Allow users to stop measuring by using signals like SIGINT (CTRL-C).
// When this happens, combinations still properly end and exit.
// The user can hit the same signal twice to abort immediately instead.
export const addStopHandler = function (progressState) {
  const stopState = {}
  const noopHandler = removeDefaultHandlers()
  const { abortSignal, abort } = createController()
  const onAbort = handleStop({ stopState, progressState, abortSignal })
  const removeStopHandlerA = removeStopHandler.bind(
    undefined,
    abort,
    noopHandler,
  )
  return { stopState, onAbort, removeStopHandler: removeStopHandlerA }
}

// Ensure default handlers for those signals are not used.
// Create a new `noop` function at each call, in case this function is called
// several times in parallel.
const removeDefaultHandlers = function () {
  const noopHandler = noop.bind()
  STOP_SIGNALS.forEach((signal) => {
    process.on(signal, noopHandler)
  })
  return noopHandler
}

// eslint-disable-next-line no-empty-function
const noop = function () {}

const restoreDefaultHandlers = function (signalHandler) {
  STOP_SIGNALS.forEach((signal) => {
    process.off(signal, signalHandler)
  })
}

const handleStop = async function ({ stopState, progressState, abortSignal }) {
  await waitForStopSignals(abortSignal)

  setPriorityDescription(progressState, STOP_DESCRIPTION)
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  stopState.stopped = true

  await waitForDelay(ABORT_DELAY, abortSignal)

  await waitForStopSignals(abortSignal)

  throw new UserError('Benchmark has been aborted')
}

const waitForStopSignals = async function (abortSignal) {
  await waitForEvents(process, STOP_SIGNALS, abortSignal)
}

// Signals usually done interactively by user in terminals, cross-platform.
// We allow non-interactive signals sending too for programmatic usage.
const STOP_SIGNALS = ['SIGINT', 'SIGBREAK', 'SIGHUP', 'SIGTERM']

const STOP_DESCRIPTION = 'Stopping...'

// Users must wait 5 seconds before being able to abort.
// This promotes proper cleanup.
// Also, this prevents misuse due to users mistakenly hitting the keys twice.
const ABORT_DELAY = 5e3

// Undo signal handling
const removeStopHandler = function (abort, signalHandler) {
  abort()
  restoreDefaultHandlers(signalHandler)
}
