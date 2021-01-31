import { failOnProcessExit } from '../error/combination.js'
import { setDescription } from '../preview/set.js'
import { receiveReturnValue } from '../process/receive.js'
import { getMinLoopDuration } from '../sample/min_loop_duration.js'

// Wait for each combination to start
export const startCombinations = async function (combinations, previewState) {
  const combinationsA = await Promise.all(combinations.map(eStartCombination))
  setDescription(previewState)
  return combinationsA
}

const eStartCombination = async function (combination) {
  return await Promise.race([
    failOnProcessExit(combination),
    startCombination(combination),
  ])
}

// If the runner does not support `repeat`, `calibrated` is always `true`
// except for the cold start.
// `calibrations` can be `undefined` if an error happened.
const startCombination = async function (combination) {
  const {
    newCombination,
    returnValue: { tasks, calibrations = [] },
  } = await receiveReturnValue(combination)
  const minLoopDuration = getMinLoopDuration(calibrations)
  return { ...newCombination, tasks, minLoopDuration }
}
