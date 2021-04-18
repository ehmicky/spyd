import { toInputsObj } from '../combination/inputs.js'
import { setDescription, setDelayedDescription } from '../preview/set.js'
import { sendAndReceive } from '../process/ipc.js'

// Start combination, i.e. make it load the combination and run any
// runner-defined start logic
export const startCombination = async function (
  { runnerConfig, taskId, taskPath, inputs },
  server,
) {
  const inputsA = toInputsObj(inputs)
  const { tasks: taskIds } = await sendAndReceive(
    { event: 'start', runnerConfig, taskId, taskPath, inputs: inputsA },
    server,
  )
  return taskIds
}

// Run the user-defined `before` hooks
export const beforeCombination = async function (previewState, server) {
  await sendAndReceive({ event: 'before' }, server)
  setDescription(previewState)
}

// Run the user-defined `after` hooks
export const afterCombination = async function (previewState, server) {
  setDelayedDescription(previewState, END_DESCRIPTION)
  await sendAndReceive({ event: 'after' }, server)
}

const END_DESCRIPTION = 'Ending...'

// Run the runner-defined end logic
export const endCombination = async function (server) {
  await sendAndReceive({ event: 'end' }, server)
}
