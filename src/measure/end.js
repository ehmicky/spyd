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
  serverChannel,
) {
  setDelayedDescription(previewState, END_DESCRIPTION)
  return await eEndCombination(combination, serverChannel)
}

const END_DESCRIPTION = 'Ending...'

const eEndCombination = async function (combination, serverChannel) {
  return await Promise.race([
    failOnProcessExit(combination),
    endCombinationLogic(combination, serverChannel),
  ])
}

const endCombinationLogic = async function (combination, serverChannel) {
  if (combinationHasErrored(combination)) {
    return combination
  }

  const { newCombination } = await sendAndReceive(
    combination,
    serverChannel,
    {},
  )
  return newCombination
}
