import {
  combinationHasErrored,
  failOnProcessExit,
} from '../error/combination.js'
import { sendAndReceive } from '../process/send.js'
import { setDelayedDescription } from '../progress/set.js'

// Stop each combination, i.e. run their cleanup logic
export const stopCombinations = async function (combinations, progressState) {
  setDelayedDescription(progressState, STOP_DESCRIPTION)
  return await Promise.all(combinations.map(eStopCombination))
}

const STOP_DESCRIPTION = 'Stopping...'

const eStopCombination = async function (combination) {
  return await Promise.race([
    failOnProcessExit(combination),
    stopCombination(combination),
  ])
}

const stopCombination = async function (combination) {
  if (combinationHasErrored(combination)) {
    return combination
  }

  const { newCombination } = await sendAndReceive(combination, {})
  return newCombination
}
