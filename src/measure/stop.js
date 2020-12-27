import process from 'process'

import now from 'precise-now'

import { UserError } from '../error/main.js'
import { setPriorityDescription, setBenchmarkEnd } from '../progress/set.js'
import {
  createController,
  waitForEvents,
  waitForDelay,
} from '../utils/timeout.js'

// Allow users to stop measuring by using signals like SIGINT (CTRL-C).
// When this happens, combinations still properly end and exit.
// The user can hit the same signal twice to abort immediately instead.
// When stopping, we do not save results to allow continuing later because this
// requires spawning processes again, making them go through cold starts again.
// This would decrease precision and create difference between results depending
// on how many times the benchmark was stopped/continued.
export const addStopHandler = function (progressState) {
  const stopState = INITIAL_STOP_STATE
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

const INITIAL_STOP_STATE = { stopped: false, longTask: false }

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

  setStopState(progressState, stopState)

  await waitForDelay(ABORT_DELAY, abortSignal)
  setPriorityDescription(progressState, ABORT_DESCRIPTION)

  await waitForStopSignals(abortSignal)

  throw new UserError('Benchmark has been aborted')
}

const setStopState = function (progressState, stopState) {
  terminateLongTask({ stopState })
  setPriorityDescription(progressState, STOP_DESCRIPTION)
  setStopBenchmarkEnd(progressState, stopState)

  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  stopState.stopped = true
}

// Update `benchmarkEnd` to match the time the currently executing task is
// expected to end.
// Not done if `sampleDurationMean` is `0` meaning either:
//  - not in measure phase
//  - measuring the first sample of the task
// In that case, we leave `benchmarkEnd` as is
const setStopBenchmarkEnd = function (
  progressState,
  { sampleStart, combination: { sampleDurationMean = 0 } = {} },
) {
  if (sampleDurationMean === 0) {
    return
  }

  const benchmarkEnd = sampleStart + sampleDurationMean
  setBenchmarkEnd(progressState, benchmarkEnd)
}

// Tasks that are longer than the `duration` configuration property are likely
// reasons why users might stop the benchmark. In that case, the task might be
// much longer to end, so we do not do any end/exit and directly terminate it.
const terminateLongTask = function ({
  stopState,
  stopState: {
    sampleStart,
    combination: { totalDuration, maxDuration, childProcess } = {},
  },
}) {
  if (!isLongTask({ sampleStart, totalDuration, maxDuration })) {
    return
  }

  // eslint-disable-next-line fp/no-mutation, no-param-reassign
  stopState.longTask = true
  childProcess.kill('SIGKILL')
}

// Total duration is `undefined` when not in `measure` phase
const isLongTask = function ({ sampleStart, totalDuration, maxDuration }) {
  return (
    totalDuration !== undefined &&
    now() - sampleStart + totalDuration > maxDuration
  )
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
