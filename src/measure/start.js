import { failOnProcessExit } from '../error/combination.js'
import { receiveReturnValue } from '../process/receive.js'
import { setDescription } from '../progress/set.js'
import { getMinLoopDuration } from '../sample/min_loop_duration.js'

// Wait for each combination to start
export const startCombinations = async function (combinations, progressState) {
  const combinationsA = await Promise.all(combinations.map(eStartCombination))
  setDescription(progressState)
  return combinationsA
}

const eStartCombination = async function (combination) {
  return await Promise.race([
    failOnProcessExit(combination),
    startCombination(combination),
  ])
}

const startCombination = async function (combination) {
  const {
    newCombination,
    returnValue: { emptyMeasures },
  } = await receiveReturnValue(combination)

  const minLoopDuration = getMinLoopDuration(emptyMeasures)
  // If the runner does not support `repeat`, `repeatInit` is always `false`
  const repeatInit = emptyMeasures.length !== 0
  return { ...newCombination, minLoopDuration, repeatInit }
}
