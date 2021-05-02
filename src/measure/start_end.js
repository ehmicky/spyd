import { toInputsObj } from '../combination/inputs.js'
import { sendAndReceive } from '../process/ipc.js'

import { runMainEvents } from './events.js'

// Measure all combinations, until the results are precise enough.
// When any combination errors, we end measuring.
// We also do this when the user stopped the benchmark (e.g. with CTRL-C).
// We still perform each combination ends, for cleanup.
// `end` is always called, for runner-specific cleanup, providing `start`
// completed.
export const runStartEnd = async function ({ combination, ...args }) {
  const taskIds = await startCombination(combination, args.server)
  const stats = await eRunMainEvents(args)
  await endCombination(args.server)
  return { stats, taskIds }
}

// Start combination, i.e. make it load the combination and run any
// runner-defined start logic
const startCombination = async function (
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

const eRunMainEvents = async function (args) {
  try {
    return await runMainEvents(args)
  } catch (error) {
    await silentEndCombination(args.server)
    throw error
  }
}

// `after` and `end` are called on exceptions.
// If an exception happens inside those themselves, it is ignored because it
// might be due to the runner being in a bad state due to the first exception.
const silentEndCombination = async function (server) {
  try {
    await endCombination(server)
  } catch {}
}

// Run the runner-defined end logic
const endCombination = async function (server) {
  await sendAndReceive({ event: 'end' }, server)
}
