import { toInputsObj } from '../combination/inputs.js'
import { setDescription } from '../preview/set.js'
import { receiveReturnValue, sendAndReceive } from '../process/ipc.js'

// Wait for each combination to setup its IPC
export const waitForCombinationSpawn = async function (server) {
  const { res } = await receiveReturnValue(server)
  return res
}

// Start combination, i.e. make it load the combination
export const startCombination = async function ({
  combination: { runnerConfig, taskId, taskPath, inputs },
  previewState,
  server,
  res,
}) {
  const inputsA = toInputsObj(inputs)
  const {
    returnValue: { tasks: taskIds },
    res: resA,
  } = await sendAndReceive(
    { event: 'start', runnerConfig, taskId, taskPath, inputs: inputsA },
    server,
    res,
  )
  setDescription(previewState)
  return { taskIds, res: resA }
}
