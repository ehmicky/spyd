import { toInputsObject } from '../../combination/inputs.js'
import { safeFinally } from '../../utils/finally.js'
import { updateDescription, END_DESCRIPTION } from '../preview/description.js'
import { sendAndReceive } from '../process/ipc.js'

import { startRunDuration, endRunDuration } from './duration.js'
import { performMeasureLoop } from './loop.js'
import { getMinLoopDuration } from './min_loop_duration.js'

// Measure all combinations, until the results are precise enough.
// When any combination errors, we end measuring.
// We also do this when the user stopped the benchmark (e.g. with CTRL-C).
// We still perform each combination ends, for cleanup.
// `end` is always called, for runner-specific cleanup, providing `start`
// completed.
// `after` and `end` are called on exceptions.
// If an exception happens inside those themselves, it is ignored because it
// might be due to the runner being in a bad state due to the first exception.
export const runEvents = async ({ combination, ...args }) => {
  const taskIds = await startCombination(combination, args.server)
  const stats = await safeFinally(
    runMainEvents.bind(undefined, args),
    endCombination.bind(undefined, args.server),
  )
  return { stats, taskIds }
}

// Start combination, i.e. make it load the combination and run any
// runner-defined start logic.
// `task.id` is `undefined` during `init` stage.
const startCombination = async (
  {
    dimensions: {
      task: { id } = {},
      runner: { config },
    },
    taskPath,
    inputsList,
  },
  server,
) => {
  const inputs = toInputsObject(inputsList)
  const { tasks: taskIds } = await sendAndReceive(
    {
      event: 'start',
      runnerConfig: config,
      taskId: id,
      taskPath,
      inputs,
    },
    server,
  )
  return taskIds
}

// Run the runner-defined end logic
const endCombination = async (server) => {
  await sendAndReceive({ event: 'end' }, server)
}

// Run user-defined logic: `before`, `main`, `after`
const runMainEvents = async (args) => {
  if (args.stage === 'init') {
    return
  }

  const minLoopDuration = await getMinLoopDuration(args)

  const startStat = startRunDuration()
  await beforeCombination(args.server)
  const stats = await safeFinally(
    performMeasureLoop.bind(undefined, { ...args, startStat, minLoopDuration }),
    afterCombination.bind(undefined, args),
  )
  const statsA = endRunDuration(startStat, stats)
  return statsA
}

// Run the user-defined `before` hooks
// As opposed to other steps, `before|after` hooks run only once per task.
// We do not add a way to share those hooks between tasks because:
//  - This can be done userland by re-using variables
//  - Tasks might be in different files which:
//     - Makes it less obvious to users that all tasks share that logic
//     - Complicates runners implementation since they would need to load
//       multiple files
//  - The logic would only be shareable within a single runner
// We do not add a way to run some logic once before|after all tasks because:
//  - This can be achieved userland by running commands before|after running
//    spyd
//  - The logic cannot be in the same process as the tasks since they each have
//    their own process
//     - i.e. this would require IPC
//  - Sharing state between tasks creates coupling between them
//  - This makes the task DX/interface more complex
//     - For example, this might create confusion with `before|after` hooks
const beforeCombination = async (server) => {
  await sendAndReceive({ event: 'before' }, server)
}

// Run the user-defined `after` hooks
// `after` is always called, for cleanup, providing `before` completed.
const afterCombination = async ({ server, previewState }) => {
  await updateDescription(previewState, END_DESCRIPTION)
  await sendAndReceive({ event: 'after' }, server)
}
