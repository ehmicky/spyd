import { toInputsObj } from '../combination/inputs.js'
import { setDescription, setDelayedDescription } from '../preview/set.js'
import { receiveReturnValue, sendAndReceive } from '../process/ipc.js'

// Wait for each combination to setup its IPC
export const waitForCombinationSpawn = async function (server) {
  const { res } = await receiveReturnValue(server)
  return res
}

// Start combination, i.e. make it load the combination and run any
// runner-defined start logic
export const startCombination = async function (
  { runnerConfig, taskId, taskPath, inputs },
  server,
  res,
) {
  const inputsA = toInputsObj(inputs)
  const {
    returnValue: { tasks: taskIds },
    res: resA,
  } = await sendAndReceive(
    { event: 'start', runnerConfig, taskId, taskPath, inputs: inputsA },
    server,
    res,
  )
  return { taskIds, res: resA }
}

// Run the user-defined `before` hooks
export const beforeCombination = async function (previewState, server, res) {
  const { res: resA } = await sendAndReceive({ event: 'before' }, server, res)
  setDescription(previewState)
  return resA
}

// Run the user-defined `after` hooks
export const afterCombination = async function (previewState, server, res) {
  setDelayedDescription(previewState, END_DESCRIPTION)
  const { res: resA } = await sendAndReceive({ event: 'after' }, server, res)
  return resA
}

const END_DESCRIPTION = 'Ending...'

// Run the runner-defined end logic
export const endCombination = async function (server, res) {
  await sendAndReceive({ event: 'end' }, server, res)
}
