import { failOnProcessExit } from '../error/combination.js'
import { setDescription } from '../preview/set.js'
import { receiveReturnValue } from '../process/receive.js'
import { getMinLoopDuration } from '../sample/min_loop_duration.js'

// Wait for each combination to start
export const startCombination = async function (
  combination,
  previewState,
  serverChannel,
) {
  const combinationA = await eStartCombination(combination, serverChannel)
  setDescription(previewState)
  return combinationA
}

const eStartCombination = async function (combination, serverChannel) {
  return await Promise.race([
    failOnProcessExit(combination),
    startCombinationLogic(combination, serverChannel),
  ])
}

// `calibrations` can be `undefined` if an error happened.
const startCombinationLogic = async function (combination, serverChannel) {
  const {
    newCombination,
    returnValue: { tasks, calibrations = [] },
  } = await receiveReturnValue(combination, serverChannel)
  const minLoopDuration = getMinLoopDuration(calibrations)
  return { ...newCombination, tasks, minLoopDuration }
}
