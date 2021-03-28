import { failOnProcessExit } from '../error/combination.js'
import { setDescription } from '../preview/set.js'
import { receiveReturnValue } from '../process/receive.js'
import { getMinLoopDuration } from '../sample/min_loop_duration.js'

// Wait for each combination to start
export const startCombination = async function (combination, previewState) {
  const combinationA = await eStartCombination(combination)
  setDescription(previewState)
  return combinationA
}

const eStartCombination = async function (combination) {
  return await Promise.race([
    failOnProcessExit(combination),
    startCombinationLogic(combination),
  ])
}

// `calibrations` can be `undefined` if an error happened.
const startCombinationLogic = async function (combination) {
  const {
    newCombination,
    returnValue: { tasks, calibrations = [] },
  } = await receiveReturnValue(combination)
  const minLoopDuration = getMinLoopDuration(calibrations)
  return { ...newCombination, tasks, minLoopDuration }
}
