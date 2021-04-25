import process from 'process'

import { StopError } from '../error/main.js'
import { noUnhandledRejection } from '../error/unhandled_rejection.js'
import { addAction, removeAction } from '../preview/action.js'
import { updateDescription, STOP_DESCRIPTION } from '../preview/description.js'
import { updatePreview } from '../preview/update.js'
import {
  createController,
  waitForEvents,
  waitForDelay,
} from '../utils/timeout.js'

// Allow users to stop measuring by using signals like SIGINT (CTRL-C).
// When this happens, combinations still properly end.
// The user can hit the same signal twice to abort immediately instead.
// When stopping, we do not save results to allow continuing later because this
// requires spawning processes again, making them go through cold starts again.
// This would decrease precision and create difference between results depending
// on how many times the benchmark was stopped/continued.
export const addStopHandler = function (previewState) {
  const stopState = { stopped: false }
  const noopHandler = removeDefaultHandlers()
  const { cancelSignal, cancel } = createController()
  // eslint-disable-next-line fp/no-mutation
  stopState.onAbort = handleStop(stopState, previewState, cancelSignal)
  noUnhandledRejection(stopState.onAbort)
  const removeStopHandlerA = removeStopHandler.bind(
    undefined,
    cancel,
    noopHandler,
  )
  return { stopState, removeStopHandler: removeStopHandlerA }
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

const handleStop = async function (stopState, previewState, cancelSignal) {
  await waitForStopSignals(cancelSignal)
  await afterStop(stopState, previewState)

  await waitForDelay(ABORT_DELAY, cancelSignal)
  await beforeAbort(previewState)

  await waitForStopSignals(cancelSignal)
  await afterAbort(previewState)
}

const afterStop = async function (stopState, previewState) {
  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  stopState.stopped = true
  removeAction(previewState, 'stop')
  await updateDescription(previewState, STOP_DESCRIPTION)
}

const beforeAbort = async function (previewState) {
  addAction(previewState, 'abort')
  await updatePreview(previewState)
}

const afterAbort = async function (previewState) {
  removeAction(previewState, 'abort')
  await updatePreview(previewState)
  throw new StopError('Benchmark has been aborted.')
}

const waitForStopSignals = async function (cancelSignal) {
  await waitForEvents(process, STOP_SIGNALS, cancelSignal)
}

// Signals usually done interactively by user in terminals, cross-platform.
// We allow non-interactive signals sending too for programmatic usage.
const STOP_SIGNALS = ['SIGINT', 'SIGBREAK', 'SIGHUP', 'SIGTERM', 'SIGQUIT']

// Users must wait 5 seconds before being able to abort.
// This promotes proper cleanup.
// Also, this prevents misuse due to users mistakenly hitting the keys twice.
const ABORT_DELAY = 5e3

// Undo signal handling
const removeStopHandler = function (cancel, signalHandler) {
  cancel()
  restoreDefaultHandlers(signalHandler)
}

// Throws on graceful stops.
// Not done if a user exception was thrown
export const throwIfStopped = function ({ stopped }) {
  if (!stopped) {
    return
  }

  throw new StopError('Benchmark has been stopped.')
}
