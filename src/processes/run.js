import { executeChild } from './execute.js'
import { shouldStop } from './stop.js'

// We initially aim at launching `PROCESS_COUNT` child processes
// If the task is slower than `duration / PROCESS_COUNT`, we launch fewer than
// `PROCESS_COUNT`.
// If `duration` is high enough to run each task until it reaches its
// `MAX_LOOPS` limit, we keep spawning new child processes. We stop once we
// reach `MAX_RESULTS` though.
// We launch child processes serially. Otherwise they would slow down each other
// and have higher variance. Multi-core CPUs are designed to run in parallel
// but in practice they do impact the performance of each other.
// This does mean we are under-utilizing CPUs.
export const runChildren = async function({
  taskPath,
  taskId,
  variationId,
  commandValue,
  commandOpt,
  duration,
  runEnd,
  cwd,
}) {
  const processDuration = duration / PROCESS_COUNT
  const input = {
    type: 'run',
    taskPath,
    opts: commandOpt,
    taskId,
    variationId,
    duration: processDuration,
  }
  const results = []

  // eslint-disable-next-line fp/no-loops
  do {
    // eslint-disable-next-line no-await-in-loop
    const { times, count } = await executeChild({
      commandValue,
      input,
      duration,
      cwd,
      taskId,
      variationId,
    })
    // eslint-disable-next-line fp/no-mutating-methods
    results.push({ times, count })
  } while (!shouldStop(runEnd, results))

  return results
}

const PROCESS_COUNT = 2e1
