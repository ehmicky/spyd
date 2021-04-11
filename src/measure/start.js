import { setDescription } from '../preview/set.js'
import { receiveReturnValue } from '../process/ipc.js'

// Wait for each combination to start
export const startCombination = async function (previewState, server) {
  const {
    returnValue: { tasks: taskIds },
    res,
  } = await receiveReturnValue(server)
  setDescription(previewState)
  return { taskIds, res }
}
