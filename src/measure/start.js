import { toInputsObj } from '../combination/inputs.js'
import { setDescription } from '../preview/set.js'
import { receiveReturnValue, sendAndReceive } from '../process/ipc.js'

// Wait for each combination to start
export const startCombination = async function (
  { runnerConfig, taskId, taskPath, inputs },
  previewState,
  server,
) {
  const { res } = await receiveReturnValue(server)

  const inputsA = toInputsObj(inputs)
  const {
    returnValue: { tasks: taskIds },
    res: resA,
  } = await sendAndReceive(
    { runnerConfig, taskId, taskPath, inputs: inputsA },
    server,
    res,
  )
  setDescription(previewState)
  return { taskIds, res: resA }
}
