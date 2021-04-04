import process from 'process'

import { AbortError } from '../error/main.js'
import { setPriorityDescription } from '../preview/set.js'
import {
  createController,
  waitForEvents,
  waitForDelay,
} from '../utils/timeout.js'

import { terminateLongTask, setStopBechmarkEnd } from './long_task.js'

// Allow users to stop measuring by using signals like SIGINT (CTRL-C).
// When this happens, combinations still properly end and exit.
// The user can hit the same signal twice to abort immediately instead.
// When stopping, we do not save results to allow continuing later because this
// requires spawning processes again, making them go through cold starts again.
// This would decrease precision and create difference between results depending
// on how many times the benchmark was stopped/continued.
export const addStopHandler = function (previewState, duration, childProcess) {
  const stopState = { stopped: false, longTask: false }
  const noopHandler = removeDefaultHandlers()
  const { abortSignal, abort } = createController()
  const onAbort = handleStop({
    stopState,
    previewState,
    abortSignal,
    duration,
    childProcess,
  })
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

const handleStop = async function ({
  stopState,
  previewState,
  abortSignal,
  duration,
  childProcess,
}) {
  await waitForStopSignals(abortSignal)

  setStopState({ previewState, stopState, duration, childProcess })

  await waitForDelay(ABORT_DELAY, abortSignal)
  setPriorityDescription(previewState, ABORT_DESCRIPTION)

  await waitForStopSignals(abortSignal)

  throw new AbortError('Benchmark has been aborted.')
}

const setStopState = function ({
  previewState,
  stopState,
  duration,
  childProcess,
}) {
  terminateLongTask({ stopState, duration, childProcess })
  setPriorityDescription(previewState, STOP_DESCRIPTION)
  setStopBechmarkEnd({ previewState, stopState, duration })

  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  stopState.stopped = true
}

const waitForStopSignals = async function (abortSignal) {
  await waitForEvents(process, STOP_SIGNALS, abortSignal)
}

// Signals usually done interactively by user in terminals, cross-platform.
// We allow non-interactive signals sending too for programmatic usage.
const STOP_SIGNALS = ['SIGINT', 'SIGBREAK', 'SIGHUP', 'SIGTERM', 'SIGQUIT']

const STOP_DESCRIPTION = 'Stopping...'
const ABORT_DESCRIPTION = 'Stopping... Type CTRL-C to abort graceful exit.'

// Users must wait 5 seconds before being able to abort.
// This promotes proper cleanup.
// Also, this prevents misuse due to users mistakenly hitting the keys twice.
const ABORT_DELAY = 5e3

// Undo signal handling
const removeStopHandler = function (abort, signalHandler) {
  abort()
  restoreDefaultHandlers(signalHandler)
}

export const isStoppedCombination = function ({ stopped }) {
  return stopped
}
