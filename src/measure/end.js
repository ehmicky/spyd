import {
  combinationHasErrored,
  failOnProcessExit,
} from '../error/combination.js'
import { setDelayedDescription } from '../preview/set.js'
import { sendAndReceive } from '../process/send.js'

// End each combination, i.e. run their cleanup logic
export const endCombinations = async function (combinations, previewState) {
  setDelayedDescription(previewState, END_DESCRIPTION)
  return await Promise.all(combinations.map(eEndCombination))
}

const END_DESCRIPTION = 'Ending...'

const eEndCombination = async function (combination) {
  return await Promise.race([
    failOnProcessExit(combination),
    endCombination(combination),
  ])
}

const endCombination = async function (combination) {
  if (combinationHasErrored(combination)) {
    return combination
  }

  const { newCombination } = await sendAndReceive(combination, {})
  return newCombination
}
