import { now } from '../now.js'

import { executeChild } from './execute.js'

// We run child processes until either:
//  - we reach the max `duration`
//  - the `results` size is over `MAX_RESULTS`.
// At least one child must be executed.
// We initially aim at launching `PROCESS_COUNT` child processes:
//  - if the task is slower than `duration / PROCESS_COUNT`, we launch fewer
//    than `PROCESS_COUNT`
//  - if `duration` is high enough to run each task until it reaches its
//    `MAX_LOOPS` limit, we keep spawning new child processes
// We launch child processes serially:
//  - otherwise they would slow down each other and have higher variance
//  - multi-core CPUs are designed to run in parallel but in practice they do
//    impact the performance of each other
//  - this does mean we are under-utilizing CPUs
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
  // eslint-disable-next-line fp/no-let
  let loops = 0

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
      ...ITERATION_RUN_FDS,
    })
    // eslint-disable-next-line fp/no-mutating-methods
    results.push({ times, count })
    // eslint-disable-next-line fp/no-mutation
    loops += times.length
  } while (now() < runEnd && loops < MAX_RESULTS)

  return results
}

const ITERATION_RUN_FDS = {
  stdio: ['ignore', 'ignore', 'ignore', 'ignore', 'pipe', 'pipe'],
  outputFd: 4,
  errorFds: [5],
}

const PROCESS_COUNT = 2e1
const MAX_RESULTS = 1e8
