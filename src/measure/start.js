import { setDescription } from '../preview/set.js'
import { receiveReturnValue } from '../process/receive.js'
import { getMinLoopDuration } from '../sample/min_loop_duration.js'

// Wait for each combination to start
// `calibrations` can be `undefined` if an error happened.
export const startCombination = async function (
  combination,
  previewState,
  server,
) {
  const {
    newCombination,
    returnValue: { tasks, calibrations = [] },
  } = await receiveReturnValue(combination, server)
  const minLoopDuration = getMinLoopDuration(calibrations)
  const combinationA = { ...newCombination, tasks, minLoopDuration }
  setDescription(previewState)
  return combinationA
}
