import { noUnhandledRejection } from '../../error/unhandled_rejection.js'
import { addAction } from '../preview/action.js'
import { refreshPreview } from '../preview/update/main.js'

import { handleStop, STOP_ACTION } from './handle.js'
import { removeDefaultHandlers, restoreDefaultHandlers } from './signals.js'

// Allow users to stop measuring by using signals like SIGINT (CTRL-C).
// When this happens, combinations still properly end.
// The user can hit the same signal twice to abort immediately instead.
// When stopping, we do not save results to allow continuing later because this
// requires spawning processes again, making them go through cold starts again.
// This would decrease precision and create difference between results depending
// on how many times the benchmark was stopped/continued.
export const addStopHandler = async (previewState) => {
  const signalHandler = removeDefaultHandlers()
  const controller = new AbortController()
  const cancel = controller.abort.bind(controller)
  const stopState = {
    stopped: false,
    signalHandler,
    cancelSignal: controller.signal,
    cancel,
  }
  // eslint-disable-next-line fp/no-mutation
  stopState.onAbort = noUnhandledRejection(handleStop(stopState, previewState))

  addAction(previewState, STOP_ACTION)
  await refreshPreview(previewState)

  return stopState
}

// Undo signal handling
export const removeStopHandler = ({ cancel, signalHandler }) => {
  cancel()
  restoreDefaultHandlers(signalHandler)
}
