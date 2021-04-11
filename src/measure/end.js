import { setDelayedDescription } from '../preview/set.js'
import { sendAndReceive } from '../process/ipc.js'

// End each combination, i.e. run their cleanup logic
export const endCombination = async function (previewState, server, res) {
  setDelayedDescription(previewState, END_DESCRIPTION)
  await sendAndReceive({ event: 'end' }, server, res)
}

const END_DESCRIPTION = 'Ending...'
