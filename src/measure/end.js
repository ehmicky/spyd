import { throwOnProcessExit } from '../error/combination.js'
import { setDelayedDescription } from '../preview/set.js'
import { sendAndReceive } from '../process/send.js'

// End each combination, i.e. run their cleanup logic
export const endCombination = async function ({
  combination,
  previewState,
  server,
  childProcess,
}) {
  setDelayedDescription(previewState, END_DESCRIPTION)
  return await eEndCombination(combination, server, childProcess)
}

const END_DESCRIPTION = 'Ending...'

const eEndCombination = async function (combination, server, childProcess) {
  return await Promise.race([
    throwOnProcessExit(childProcess),
    endCombinationLogic(combination, server),
  ])
}

const endCombinationLogic = async function (combination, server) {
  const { newCombination } = await sendAndReceive(combination, server, {})
  return newCombination
}
