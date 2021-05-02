import { toInputsObj } from '../combination/inputs.js'
import { updateDescription, END_DESCRIPTION } from '../preview/description.js'
import { sendAndReceive } from '../process/ipc.js'

import { performMeasureLoop } from './loop.js'
import { getMinLoopDuration } from './min_loop_duration.js'

// Measure all combinations, until the results are precise enough.
// When any combination errors, we end measuring.
// We also do this when the user stopped the benchmark (e.g. with CTRL-C).
// We still perform each combination ends, for cleanup.
// `end` is always called, for runner-specific cleanup, providing `start`
// completed.
export const runEvents = async function ({ combination, ...args }) {
  const taskIds = await startCombination(combination, args.server)
  const stats = await runMainEvents(args)
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

// Run user-defined logic: `before`, `main`, `after`
const runMainEvents = async function (args) {
  if (args.stage === 'init') {
    return
  }

  try {
    await beforeCombination(args.server)
    const stats = await getCombinationStats(args)
    await afterCombination(args)
    return stats
  } catch (error) {
    await silentEndCombination(args.server)
    throw error
  }
}

// Run the user-defined `before` hooks
const beforeCombination = async function (server) {
  await sendAndReceive({ event: 'before' }, server)
}

const getCombinationStats = async function (args) {
  try {
    const minLoopDuration = await getMinLoopDuration(args)
    return await performMeasureLoop({ ...args, minLoopDuration })
  } catch (error) {
    await silentAfterCombination(args)
    throw error
  }
}

const silentAfterCombination = async function (args) {
  try {
    await afterCombination(args)
  } catch {}
}

// Run the user-defined `after` hooks
// `after` is always called, for cleanup, providing `before` completed.
const afterCombination = async function ({ server, previewState }) {
  await updateDescription(previewState, END_DESCRIPTION)
  await sendAndReceive({ event: 'after' }, server)
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
