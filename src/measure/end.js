import { setDelayedDescription } from '../preview/set.js'
import { sendAndReceive } from '../process/send.js'

// End each combination, i.e. run their cleanup logic
export const endCombination = async function (
  combination,
  previewState,
  server,
) {
  setDelayedDescription(previewState, END_DESCRIPTION)
  const { newCombination } = await sendAndReceive(combination, server, {})
  return newCombination
}

const END_DESCRIPTION = 'Ending...'
