import { setDescription } from '../preview/set.js'
import { receiveReturnValue } from '../process/ipc.js'
import { getMinLoopDuration } from '../sample/min_loop_duration.js'

// Wait for each combination to start
// `calibrations` can be `undefined` if an error happened.
export const startCombination = async function (previewState, server) {
  const {
    returnValue: { tasks: taskIds, calibrations },
    res,
  } = await receiveReturnValue(server)
  const minLoopDuration = getMinLoopDuration(calibrations)
  setDescription(previewState)
  return { res, taskIds, minLoopDuration }
}
