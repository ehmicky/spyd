import {
  combinationHasErrored,
  failOnProcessExit,
} from '../error/combination.js'
import { setDelayedDescription } from '../preview/set.js'
import { sendAndReceive } from '../process/send.js'

// End each combination, i.e. run their cleanup logic
export const endCombination = async function (
  combination,
  previewState,
  server,
) {
  setDelayedDescription(previewState, END_DESCRIPTION)
  return await eEndCombination(combination, server)
}

const END_DESCRIPTION = 'Ending...'

const eEndCombination = async function (combination, server) {
  return await Promise.race([
    failOnProcessExit(combination),
    endCombinationLogic(combination, server),
  ])
}

const endCombinationLogic = async function (combination, server) {
  if (combinationHasErrored(combination)) {
    return combination
  }

  const { newCombination } = await sendAndReceive(combination, server, {})
  return newCombination
}
